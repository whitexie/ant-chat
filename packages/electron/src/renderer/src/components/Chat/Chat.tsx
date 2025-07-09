import type { ChatFeatures, ConversationsId, IAttachment, IImage, IMessage } from '@ant-chat/shared'
import { App, Skeleton } from 'antd'
import { lazy, Suspense } from 'react'
import { useShallow } from 'zustand/shallow'
import { createConversations, createUserMessage } from '@/api/dataFactory'
import { DEFAULT_TITLE } from '@/constants'
import { useChatSettingsContext } from '@/contexts/chatSettings'
import { useChatSttingsStore } from '@/store/chatSettings'
import {
  addConversationsAction,
  useConversationsStore,
} from '@/store/conversation'
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

const BubbleList = lazy(() => import('./BubbleList'))
const RunnerCode = lazy(() => import('../RunnerCode'))

export default function Chat() {
  const messages = useMessagesStore(state => state.messages)
  const activeConversationsId = useMessagesStore(state => state.activeConversationsId)
  const currentConversations = useConversationsStore(state => state.conversations.find(item => item.id === activeConversationsId))

  const isLoading = useMessagesStore(state => state.requestStatus === 'loading')
  const features = useChatSttingsStore(useShallow(state => ({ onlineSearch: state.onlineSearch, enableMCP: state.enableMCP })))

  const { notification } = App.useApp()
  const { settings, updateSettings } = useChatSettingsContext()

  async function onSubmit(
    message: string,
    images: IImage[],
    attachments: IAttachment[],
    features: ChatFeatures,
  ) {
    if (!settings.modelId) {
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
      const conversation = await addConversationsAction(createConversations({ settings }))
      id = conversation.id
      isNewConversation = true
    }

    await setActiveConversationsId(id)

    const messageItem: IMessage = createUserMessage({ images, attachments, content: [{ type: 'text', text: message }], convId: id as ConversationsId })
    await addMessageAction(messageItem)

    // 发送请求
    await onRequestAction(id, features, settings)

    // 初始化会话标题
    if (currentConversations?.title === DEFAULT_TITLE || isNewConversation) {
      // 1s后再次初始化会话标题, 避免请求频繁导致的标题未更新
      setTimeout(() => {
        // TODO 初始化标题
        // initConversationsTitle(id, )
      }, 1000)
    }
  }

  return (
    <div key={currentConversations?.id} className="grid w-full grid-rows-[1fr_max-content] h-(--mainHeight) md:h-[100dvh] relative mx-auto">
      <div
        className="absolute left-0 top-0 z-10
          w-full h-5
          bg-linear-to-b from-white dark:from-black to-transparent"
      >
      </div>
      {
        messages.length > 0
          ? (
              <Suspense fallback={<BubbleSkeleton />}>
                <BubbleList
                  messages={messages}
                  conversationsId={activeConversationsId}
                  onRefresh={async (message) => {
                    if (!settings.modelId) {
                      notification.error({ message: '请选择模型' })
                      return
                    }
                    refreshRequestAction(activeConversationsId, message, features, settings)
                  }}
                  onExecuteAllCompleted={
                    () => {
                      if (!settings.modelId) {
                        notification.error({ message: '请选择模型' })
                        return
                      }
                      onRequestAction(activeConversationsId, features, settings)
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
              value={settings.modelId}
              onChange={(modelInfo) => {
                const { id: modelId, maxTokens, temperature } = modelInfo
                updateSettings({ modelId, maxTokens, temperature })
              }}
            />
          )}
          onSubmit={onSubmit}
          onCancel={() => {
            abortSendChatCompletions()
            setRequestStatus('cancel')
          }}
        />
      </div>
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
