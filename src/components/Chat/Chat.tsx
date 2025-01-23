import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { getConversationTitle } from '@/api'
import { DEFAULT_TITLE, Role } from '@/constants'
import { activeConversationSelector, createConversation, requestStatusSelector, useConversationsStore } from '@/store/conversation'
import { useModelConfigStore } from '@/store/modelConfig'
import { clipboardWriteText, formatTime, getNow, uuid } from '@/utils'
import { Bubble } from '@ant-design/x'
import { App, Typography } from 'antd'
import { useRef } from 'react'
import { useShallow } from 'zustand/shallow'
import BubbleFooter from './BubbleFooter'
import ChatSender from './ChatSender'
import { roles } from './roles'

function createMessageContent(message: string, images: API.IImage[]) {
  if (!images.length)
    return message
  const content: (API.ImageContent | API.TextContent)[] = images.map((item) => {
    return {
      type: 'image_url',
      image_url: { ...item },
    }
  })
  content.push({ type: 'text', text: message })
  return content
}

export default function Chat() {
  const abortRef = useRef<() => void>(() => {})
  const { message: messageFunc } = App.useApp()
  const { activeConversation, onRequest, refreshRequest, deleteMessage, renameConversation } = useConversationsStore(useShallow(activeConversationSelector))
  const { requestStatus, setRequestStatus } = useConversationsStore(useShallow(requestStatusSelector))
  const addConversation = useConversationsStore(state => state.addConversation)
  const activeConversationId = activeConversation?.id || ''
  const currentConversation = activeConversation
  const model = useModelConfigStore(state => state.model)
  const messages = currentConversation?.messages || []

  const isLoading = requestStatus === 'loading'

  const bubbleList = messages.map((msg) => {
    const { id: key, role, content, status, createAt } = msg
    const item: BubbleDataType = {
      role,
      content,
      key,
      header: <div className="text-xs flex items-center">{formatTime(createAt)}</div>,
      footer: <BubbleFooter message={msg} onClick={handleFooterButtonClick} />,
    }

    if (item.role === Role.AI && status === 'error') {
      item.content = (
        <>
          <Typography.Paragraph>
            <Typography.Text type="danger">{content as string}</Typography.Text>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <Typography.Text type="danger">请求失败，请检查配置是否正确</Typography.Text>
          </Typography.Paragraph>
        </>
      )
    }

    return item
  })

  async function handleFooterButtonClick(buttonName: string, message: ChatMessage) {
    const mapping = {
      copy: () => copyMessage(message),
      refresh: () => refreshRequest(activeConversationId, message, model),
      delete: () => deleteMessage(activeConversationId, message.id),
    }
    mapping[buttonName as keyof typeof mapping]?.()
  }

  async function copyMessage(message: ChatMessage) {
    const content = message.content as string
    const result = await clipboardWriteText(content)
    if (result.ok) {
      messageFunc.success(result.message)
    }
    else {
      messageFunc.error(result.message)
    }
  }

  async function onSubmit(message: string, images: API.IImage[]) {
    let id = activeConversationId
    let isNewConversation = false
    // 如果当前没有会话，则创建一个
    if (!activeConversationId) {
      const conversation = createConversation()
      addConversation(conversation)
      id = conversation.id
      isNewConversation = true
    }

    const messageItem: ChatMessage = {
      id: uuid(),
      role: Role.USER,
      content: createMessageContent(message, images),
      createAt: getNow(),
    }

    // 发送请求
    await onRequest(id, messageItem, model)

    // 初始化会话标题
    if (
      (currentConversation && currentConversation.title === DEFAULT_TITLE)
      || isNewConversation
    ) {
      initConversationTitle(id, messageItem)
    }
  }

  async function initConversationTitle(id: string, message: ChatMessage) {
    const title = await getConversationTitle([...messages, message], model)

    renameConversation(id, title)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl m-auto">
      <div className="flex-1 overflow-y-auto">
        <div>
          <Bubble.List
            items={bubbleList}
            roles={roles}
            className="h-[var(--bubbleListHeight)] scroll-hidden"
          />
        </div>
      </div>
      <div className={`w-full px-2 flex-shrink-0 w-full h-[var(--senderHeight)] relative `}>
        <ChatSender
          loading={isLoading}
          onSubmit={(message, images) => onSubmit(message, images)}
          onCancel={() => {
            abortRef.current()
            setRequestStatus('cancel')
          }}
        />
      </div>
    </div>
  )
}
