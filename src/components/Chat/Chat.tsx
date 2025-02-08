import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { DEFAULT_TITLE, Role } from '@/constants'
import {
  addConversationsAction,
  createConversation,
  createMessage,
  deleteMessageAction,
  executeAbortCallbacks,
  initCoversationsTitle,
  onRequestAction,
  refreshRequestAction,
  setRequestStatus,
  updateConversationsSettingsACtion,
  useConversationsStore,
} from '@/store/conversation'
import { useActiveModelConfig, useModelConfigStore } from '@/store/modelConfig'
import { clipboardWriteText, formatTime } from '@/utils'
import { SettingOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Typography } from 'antd'
import { useState } from 'react'
import BubbleFooter from './BubbleFooter'
import ChatSender from './ChatSender'
import ConversationsSettings from './ConversationsSettings'
import ConversationsTitle from './ConversationsTitle'
import { roles } from './roles'

function createMessageContent(message: string, images: IImage[]) {
  if (!images.length)
    return message

  const content: (ImageContent | TextContent)[] = images.map((item) => {
    return {
      type: 'image_url',
      image_url: { ...item },
    }
  })
  content.push({ type: 'text', text: message })
  return content
}

export default function Chat() {
  const [open, setOpen] = useState(false)
  const { message: messageFunc } = App.useApp()
  const messages = useConversationsStore(state => state.messages)
  const activeConversationId = useConversationsStore(state => state.activeConversationId)
  const currentConversation = useConversationsStore(state => state.conversations.find(item => item.id === activeConversationId))
  const active = useModelConfigStore(state => state.active)
  const defaultModelConfig = useActiveModelConfig()

  const isLoading = useConversationsStore(state => state.requestStatus === 'loading')

  const items = [
    {
      label: '对话设置',
      key: 'setting',
      icon: <SettingOutlined />,
      onClick: () => {
        setOpen(true)
      },
    },
  ]

  const config = currentConversation?.settings || { active, modelConfig: defaultModelConfig }

  const bubbleList = messages.map((msg) => {
    const { id: key, role, content, status, createAt } = msg
    const item: BubbleDataType = {
      role,
      content,
      key,
      loading: status === 'loading',
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
      refresh: () => refreshRequestAction(activeConversationId, message, config),
      delete: () => deleteMessageAction(message.id),
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

  async function onSubmit(message: string, images: IImage[]) {
    let id = activeConversationId
    let isNewConversation = false
    // 如果当前没有会话，则创建一个
    if (!activeConversationId) {
      const conversation = createConversation()
      await addConversationsAction(conversation)
      id = conversation.id
      isNewConversation = true
    }

    const messageItem: ChatMessage = createMessage({ content: createMessageContent(message, images), convId: id })

    // 发送请求
    await onRequestAction(id, messageItem, config)

    // 初始化会话标题
    if (currentConversation?.title === DEFAULT_TITLE || isNewConversation) {
      initCoversationsTitle()
    }
  }

  async function handleSave(config: IConversationsSettings) {
    if (!currentConversation) {
      console.error('save fail. current conversation not exists')
      return
    }
    const id = currentConversation?.id
    await updateConversationsSettingsACtion(id, config)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl m-auto">
      <div className="flex-1 overflow-y-auto">
        <ConversationsTitle
          key={currentConversation?.id}
          conversation={currentConversation}
          items={items}
        />
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
            executeAbortCallbacks()
            setRequestStatus('cancel')
          }}
        />
      </div>

      <ConversationsSettings
        open={open}
        onClose={() => setOpen(false)}
        onSave={handleSave}
        initialValues={currentConversation?.settings}
      />
    </div>
  )
}
