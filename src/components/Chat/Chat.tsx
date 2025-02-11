import type { ConversationsId, IConversationsSettings, IImage, IImageContent, IMessage, ITextContent } from '@/db/interface'
import { DEFAULT_TITLE } from '@/constants'
import {
  addConversationsAction,
  createConversation,
  createMessage,
  executeAbortCallbacks,
  initCoversationsTitle,
  onRequestAction,
  setRequestStatus,
  updateConversationsSettingsAction,
  useConversationsStore,
} from '@/store/conversation'
import { useActiveModelConfig } from '@/store/modelConfig'
import { SettingOutlined } from '@ant-design/icons'
import { lazy, Suspense, useState } from 'react'
import ChatSender from './ChatSender'
import ConversationsTitle from './ConversationsTitle'

const ConversationsSettings = lazy(() => import('./ConversationsSettings'))
const BubbleList = lazy(() => import('./BubbleList'))

function createMessageContent(message: string, images: IImage[]) {
  if (!images.length)
    return message

  const content: (IImageContent | ITextContent)[] = images.map(item => ({ type: 'image_url', image_url: { ...item } }))
  content.push({ type: 'text', text: message })
  return content
}

export default function Chat() {
  const [open, setOpen] = useState(false)
  const messages = useConversationsStore(state => state.messages)
  const activeConversationId = useConversationsStore(state => state.activeConversationId)
  const currentConversation = useConversationsStore(state => state.conversations.find(item => item.id === activeConversationId))
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

  const config = currentConversation?.settings?.modelConfig || defaultModelConfig

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

    const messageItem: IMessage = createMessage({ content: createMessageContent(message, images), convId: id as ConversationsId })

    // 发送请求
    await onRequestAction(id as ConversationsId, messageItem, config)

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
    await updateConversationsSettingsAction(id, config)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl m-auto">
      <div className="flex-1 overflow-y-auto">
        <ConversationsTitle
          key={currentConversation?.id}
          conversation={currentConversation}
          items={items}
        />
        {
          messages.length > 0
            ? (
                <Suspense>
                  <BubbleList
                    messages={messages}
                    config={config}
                    currentConversations={currentConversation}
                  />
                </Suspense>
              )
            : null
        }
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
