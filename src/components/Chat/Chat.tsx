import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { Role } from '@/constants'
import { activeConversationSelector, createConversation, requestStatusSelector, useConversationsStore } from '@/store/conversation'
import { useModelConfigStore } from '@/store/modelConfig'
import { clipboardWriteText, getNow, uuid } from '@/utils'
import { Bubble } from '@ant-design/x'
import { App, Typography } from 'antd'
import { useMemo, useRef } from 'react'
import { useShallow } from 'zustand/shallow'
import BubbleFooter from './BubbleFooter'
import ChatSender from './ChatSender'
import MessageContent from './MessageContent'
import RenderMarkdown from './RenderMarkdown'
import { roles } from './roles'

function messageRender(content: API.MessageContent): React.ReactNode {
  return <MessageContent content={content} />
}

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
  const { activeConversation, onRequest, refreshRequest, deleteMessage } = useConversationsStore(useShallow(activeConversationSelector))
  const { requestStatus, setRequestStatus } = useConversationsStore(useShallow(requestStatusSelector))
  const addConversation = useConversationsStore(state => state.addConversation)
  const activeConversationId = activeConversation?.id || ''
  const currentConversation = activeConversation
  const model = useModelConfigStore(state => state.model)
  const messages = currentConversation?.messages || []

  const isLoading = requestStatus === 'loading'

  const bubbleList = useMemo(() => {
    return messages.map((msg) => {
      const { id: key, role, content, status } = msg
      const item: BubbleDataType = { role, content, key, footer: <BubbleFooter message={msg} onClick={handleFooterButtonClick} /> }

      if (item.role === Role.AI) {
        if (status === 'error') {
          item.content = (
            <>
              <Typography.Paragraph>
                <Typography.Text type="danger">{content as string}</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Typography.Text type="danger">发送失败，请检查配置是否正确</Typography.Text>
              </Typography.Paragraph>
            </>
          )
        }
        else {
          item.messageRender = (content: string) => <RenderMarkdown content={content} />
        }
      }
      else if (item.role === Role.USER) {
        item.messageRender = messageRender
      }

      return item
    })
  }, [messages])

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
    // 如果当前没有会话，则创建一个
    if (!activeConversationId) {
      const conversation = createConversation()
      addConversation(conversation)
      id = conversation.id
    }

    const messageItem: ChatMessage = {
      id: uuid(),
      role: Role.USER,
      content: createMessageContent(message, images),
      createAt: getNow(),
    }

    // 发送请求

    await onRequest(id, messageItem, model)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl m-auto p-1">
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          <Bubble.List
            items={bubbleList}
            roles={roles}
            className="h-[var(--bubbleListHeight)] scroll-hidden"
          />
        </div>
      </div>
      <div className="w-full p-2 flex-shrink-0 w-full h-[72px] relative">
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
