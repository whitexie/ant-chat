import type { ConversationsId, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleContent } from '@/types/global'
import { Role } from '@/constants'
import { deleteMessageAction, nextPageMessagesAction, refreshRequestAction } from '@/store/conversation/actions'
import { useConversationsStore } from '@/store/conversation/conversationsStore'
import { getFeatures } from '@/store/features'
import { clipboardWriteText, formatTime } from '@/utils'
import { RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Typography } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { InfiniteScroll } from '../InfiniteScroll'
import Loading from '../Loading'
import BubbleFooter from './BubbleFooter'
import MessageContent from './MessageContent'

interface Props {
  messages: IMessage[]
  conversationsId: string
  config: ModelConfig
}

function BubbleList({ config, messages, conversationsId }: Props) {
  const { message: messageFunc } = App.useApp()
  const infiniteScrollRef = useRef<{ scrollToBottom: () => void }>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const pageIndex = useConversationsStore(state => state.pageIndex)
  const messageTotal = useConversationsStore(state => state.messageTotal)

  // 处理首次加载和新消息时的滚动
  useEffect(
    () => {
      if ((pageIndex === 0 || messages.length > 0)) {
        infiniteScrollRef.current?.scrollToBottom()
      }
    },
    [pageIndex, messages.length],
  )

  // 检查是否还有更多消息
  useEffect(() => {
    if (messages.length >= messageTotal) {
      setHasMore(false)
    }
  }, [messages.length, messageTotal])

  async function copyMessage(message: IMessage) {
    const content = message.content as string
    const result = await clipboardWriteText(content)
    if (result.ok) {
      messageFunc.success(result.message)
    }
    else {
      messageFunc.error(result.message)
    }
  }

  async function handleFooterButtonClick(buttonName: string, message: IMessage) {
    const mapping = {
      copy: () => copyMessage(message),
      refresh: () => refreshRequestAction(conversationsId as ConversationsId, message, config, getFeatures()),
      delete: () => deleteMessageAction(message.id),
    }
    mapping[buttonName as keyof typeof mapping]?.()
  }

  // 加载更多消息
  const handleLoadMore = useCallback(async () => {
    setIsLoading(true)
    try {
      await nextPageMessagesAction(conversationsId as ConversationsId)
    }
    finally {
      setIsLoading(false)
    }
  }, [conversationsId])

  return (
    <InfiniteScroll
      ref={infiniteScrollRef}
      className="p-4 w-[var(--chat-width)] mx-auto"
      hasMore={hasMore}
      loading={isLoading}
      onLoadMore={handleLoadMore}
      direction="bottom"
      loadingComponent={(
        <div className="flex justify-center py-2">
          <Loading />
        </div>
      )}
    >
      <div className="space-y-4">
        {messages.map(msg => (
          <Bubble<BubbleContent>
            key={msg.id}
            loading={msg.status === 'loading'}
            placement={msg.role === Role.USER ? 'end' : 'start'}
            style={{
              marginInlineEnd: msg.role === Role.USER ? 10 : 44,
              marginInlineStart: msg.role === Role.USER ? 44 : 10,
            }}
            avatar={getRoleAvatar(msg.role)}
            messageRender={() => {
              if (msg.status === 'error') {
                return (
                  <>
                    <Typography.Paragraph>
                      <Typography.Text type="danger">请求失败，请检查配置是否正确</Typography.Text>
                    </Typography.Paragraph>
                    <Typography.Paragraph>
                      <Typography.Text type="danger">{msg.content}</Typography.Text>
                    </Typography.Paragraph>
                  </>
                )
              }
              return (
                <MessageContent
                  images={msg.images}
                  attachments={msg.attachments}
                  content={msg.content}
                  reasoningContent={msg.reasoningContent || ''}
                  status={msg.status || 'success'}
                />
              )
            }}
            content={msg.content}
            header={<div className="text-xs flex items-center">{formatTime(msg.createAt)}</div>}
            footer={<BubbleFooter message={msg} onClick={handleFooterButtonClick} />}
            typing={msg.status === 'typing' ? { step: 1, interval: 50 } : false}
          />
        ))}
      </div>
    </InfiniteScroll>
  )
}

function getRoleAvatar(role: Role) {
  if (role === Role.USER) {
    return { icon: <UserOutlined />, style: { background: '#87d068' } }
  }
  else if (role === Role.SYSTEM) {
    return { icon: <SmileFilled />, style: { background: '#DE732D' } }
  }
  else if (role === Role.AI) {
    return { icon: <RobotFilled />, style: { background: '#69b1ff' } }
  }
}

export default BubbleList
