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
import Sender from '../Sender'
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
    <div key={currentConversations?.id} className="flex flex-col h-full relative w-[var(--chat-width)] mx-auto">
      <div className="flex-shrink-0">
        <ConversationsTitle
          conversation={currentConversations}
          items={items}
        />
      </div>
      <div className="h-[var(--bubbleListHeight)] mx-auto">
        <div className="h-full">
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
      </div>
      <div className="px-2 flex-shrink-0">
        <Sender
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
