import type { ConversationsId, IAttachment, IImage, IMessage } from '@/db/interface'
import type { UpdateConversationsSettingsConfig } from '@/store/conversation'
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

export default function Chat() {
  const [open, setOpen] = useState(false)
  const messages = useConversationsStore(state => state.messages)
  const activeConversationId = useConversationsStore(state => state.activeConversationId)
  const currentConversations = useConversationsStore(state => state.conversations.find(item => item.id === activeConversationId))
  const defaultModelConfig = useActiveModelConfig()

  const isLoading = useConversationsStore(state => state.requestStatus === 'loading')
  const config = currentConversations?.settings?.modelConfig || defaultModelConfig

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

  async function onSubmit(message: string, images: IImage[], attachments: IAttachment[]) {
    let id = activeConversationId
    let isNewConversation = false
    // 如果当前没有会话，则创建一个
    if (!activeConversationId) {
      const conversation = createConversation()
      await addConversationsAction(conversation)
      id = conversation.id
      isNewConversation = true
    }

    const messageItem: IMessage = createMessage({ images, attachments, content: message, convId: id as ConversationsId })

    // 发送请求
    await onRequestAction(id as ConversationsId, messageItem, config)

    // 初始化会话标题
    if (currentConversations?.title === DEFAULT_TITLE || isNewConversation) {
      initCoversationsTitle()
    }
  }

  async function handleSave(config: UpdateConversationsSettingsConfig) {
    if (!currentConversations) {
      console.error('save fail. current conversation not exists')
      return
    }
    const id = currentConversations?.id
    await updateConversationsSettingsAction(id, config)
  }

  return (
    <div className="flex flex-col h-full w-[var(--chat-width)] m-auto">
      <div className="flex-1 overflow-y-auto">
        <ConversationsTitle
          key={currentConversations?.id}
          conversation={currentConversations}
          items={items}
        />
        {
          messages.length > 0 && (
            <Suspense>
              <BubbleList
                messages={messages}
                config={config}
                currentConversations={currentConversations}
              />
            </Suspense>
          )
        }
      </div>
      <div className={`w-full px-2 flex-shrink-0 w-full h-[var(--senderHeight)] relative `}>
        <ChatSender
          loading={isLoading}
          onSubmit={onSubmit}
          onCancel={() => {
            executeAbortCallbacks()
            setRequestStatus('cancel')
          }}
        />
      </div>
      {
        currentConversations && (
          <ConversationsSettings
            key={currentConversations.id}
            open={open}
            onClose={() => setOpen(false)}
            conversations={currentConversations}
            onSave={handleSave}
          />
        )
      }

    </div>
  )
}
