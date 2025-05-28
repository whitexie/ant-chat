import type { ConversationsId, IAttachment, IImage, IMessage } from '@ant-chat/shared'
import type { ChatFeatures } from '@/services-provider/interface'
import type { UpdateConversationsSettingsConfig } from '@/store/conversation'
import { SettingOutlined } from '@ant-design/icons'
import { App, Skeleton } from 'antd'
import { lazy, Suspense, useState } from 'react'
import { createConversations, createUserMessage } from '@/api/dataFactory'
import { DEFAULT_TITLE } from '@/constants'
import { setModel, useChatSttings } from '@/store/chatSettings'
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
  refreshRequestAction,
  setActiveConversationsId,
  setRequestStatus,
  useMessagesStore,
} from '@/store/messages'
import Loading from '../Loading'
import Sender from '../Sender'
import { ModelControlPanel } from '../Sender/PickerModel'
import TypingEffect from '../TypingEffect'
import ConversationsTitle from './ConversationsTitle'

const ConversationsSettings = lazy(() => import('./ConversationsSettings'))
const BubbleList = lazy(() => import('./BubbleList'))
const RunnerCode = lazy(() => import('../RunnerCode'))

export default function Chat() {
  const [open, setOpen] = useState(false)
  const messages = useMessagesStore(state => state.messages)
  const activeConversationsId = useMessagesStore(state => state.activeConversationsId)
  const currentConversations = useConversationsStore(state => state.conversations.find(item => item.id === activeConversationsId))

  const isLoading = useMessagesStore(state => state.requestStatus === 'loading')
  const features = useFeaturesState()

  const { notification } = App.useApp()

  // ============================ 选择模型 ============================
  const model = useChatSttings(state => state.model)

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
    if (!model) {
      notification.error({
        message: '请选择模型',
        placement: 'bottomRight',
      })
      return
    }

    let id = activeConversationsId
    let isNewConversation = false
    // 如果当前没有会话，则创建一个
    if (!activeConversationsId) {
      const conversation = await addConversationsAction(createConversations())
      id = conversation.id
      isNewConversation = true
    }

    await setActiveConversationsId(id)

    const messageItem: IMessage = createUserMessage({ images, attachments, content: [{ type: 'text', text: message }], convId: id as ConversationsId })
    await addMessageAction(messageItem)

    // 发送请求
    await onRequestAction(id, features, model)

    // 初始化会话标题
    if (currentConversations?.title === DEFAULT_TITLE || isNewConversation) {
      // 1s后再次初始化会话标题, 避免请求频繁导致的标题未更新
      setTimeout(() => {
        initConversationsTitle(model)
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
              <Suspense fallback={<BubbleSkeleton />}>
                <BubbleList
                  messages={messages}
                  conversationsId={activeConversationsId}
                  onRefresh={async (message) => {
                    if (!model) {
                      notification.error({ message: '请选择模型' })
                      return
                    }
                    refreshRequestAction(activeConversationsId, message, features, model)
                  }}
                  onExecuteAllCompleted={
                    () => {
                      if (!model) {
                        notification.error({ message: '请选择模型' })
                        return
                      }
                      onRequestAction(activeConversationsId, features, model)
                    }
                  }
                />
              </Suspense>
            )
          : (
              <h1 className="text-center text-4xl absolute bottom-[70%] py-3 left-0 right-0 text-gray-500">
                <TypingEffect text="有什么可以帮忙的？" />
              </h1>
            )
      }
      <div className="px-2 pb-4">
        <Sender
          loading={isLoading}
          actions={(
            <ModelControlPanel
              value={model}
              onChange={setModel}
            />
          )}
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

function BubbleSkeleton() {
  return (
    <div className="w-(--chat-width) mx-auto flex flex-col gap-3">
      <Skeleton avatar paragraph={{ rows: 4 }} active />
      <Skeleton avatar paragraph={{ rows: 4 }} active />
      <Skeleton avatar paragraph={{ rows: 4 }} active />
    </div>
  )
}
