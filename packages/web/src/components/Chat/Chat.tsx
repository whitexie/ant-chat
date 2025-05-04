import type { ConversationsId, IAttachment, IImage, IMessage } from '@/db/interface'
import type { ChatFeatures } from '@/services-provider/interface'
import type { UpdateConversationsSettingsConfig } from '@/store/conversation'
import { DEFAULT_TITLE } from '@/constants'
import { createConversations, createUserMessage } from '@/db/dataFactory'
import {
  addConversationsAction,
  initConversationsTitle,
  updateConversationsSettingsAction,
  useConversationsStore,
} from '@/store/conversation'
import { useFeaturesState } from '@/store/features'
import {
  abortSendChatCompletions,
  addMessageAction,
  onRequestAction,
  setActiveConversationsId,
  setRequestStatus,
  useMessagesStore,
} from '@/store/messages'
import { useActiveModelConfig } from '@/store/modelConfig'
import { SettingOutlined } from '@ant-design/icons'
import { lazy, Suspense, useState } from 'react'
import Loading from '../Loading'
import Sender from '../Sender'
import TypingEffect from '../TypingEffect'
import ConversationsTitle from './ConversationsTitle'

const ConversationsSettings = lazy(() => import('./ConversationsSettings'))
const BubbleList = lazy(() => import(/* vitePrefetch: true */ './BubbleList'))
const RunnerCode = lazy(() => import('../RunnerCode'))

export default function Chat() {
  const [open, setOpen] = useState(false)
  const messages = useMessagesStore(state => state.messages)
  const activeConversationsId = useMessagesStore(state => state.activeConversationsId)
  const currentConversations = useConversationsStore(state => state.conversations.find(item => item.id === activeConversationsId))
  const defaultModelConfig = useActiveModelConfig()
  const isLoading = useMessagesStore(state => state.requestStatus === 'loading')
  const features = useFeaturesState()

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

  async function onSubmit(message: string, images: IImage[], attachments: IAttachment[], features: ChatFeatures) {
    let id = activeConversationsId
    let isNewConversation = false
    // 如果当前没有会话，则创建一个
    if (!activeConversationsId) {
      const conversation = createConversations()
      await addConversationsAction(conversation)
      id = conversation.id
      isNewConversation = true
    }

    await setActiveConversationsId(id as ConversationsId)

    const messageItem: IMessage = createUserMessage({ images, attachments, content: message, convId: id as ConversationsId })
    await addMessageAction(messageItem)

    // 发送请求
    await onRequestAction(id as ConversationsId, config, features)

    // 初始化会话标题
    if (currentConversations?.title === DEFAULT_TITLE || isNewConversation) {
      // 1s后再次初始化会话标题, 避免请求频繁导致的标题未更新
      setTimeout(() => {
        initConversationsTitle()
      }, 1000)
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
    <div key={currentConversations?.id} className="grid w-full grid-rows-[max-content_1fr_max-content] h-(--mainHeight) md:h-[100dvh] relative mx-auto">
      <div>
        <ConversationsTitle
          conversation={currentConversations}
          items={items}
        />
      </div>
      {
        messages.length > 0
          ? (
              <BubbleList
                config={config}
                messages={messages}
                conversationsId={activeConversationsId}
                onExecuteAllCompleted={
                  async () => {
                    await onRequestAction(activeConversationsId, config, features)
                  }
                }
              />
            )
          : (
              <h1 className="text-center text-3xl absolute bottom-[70%] py-3 left-0 right-0 text-gray-500">
                <TypingEffect text="有什么可以帮忙的？" />
              </h1>
            )
      }
      <div className="px-2 pb-4">
        <Sender
          loading={isLoading}
          onSubmit={onSubmit}
          onCancel={() => {
            abortSendChatCompletions()
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
      <Suspense fallback={<Loading />}>
        <RunnerCode />
      </Suspense>
    </div>
  )
}
