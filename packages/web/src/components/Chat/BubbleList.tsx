import type { ConversationsId, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleContent } from '@/types/global'
import { Role } from '@/constants'
import { deleteMessageAction, nextPageMessagesAction, refreshRequestAction } from '@/store/conversation/actions'
import { useConversationsStore } from '@/store/conversation/conversationsStore'
import { getFeatures } from '@/store/features'
import { clipboardWriteText, formatTime } from '@/utils'
import { ArrowDownOutlined, RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Button, Typography } from 'antd'
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
  const bottomDivRef = useRef<HTMLDivElement>(null)
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(true)
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

  // 自动滚动到最底部
  useEffect(() => {
    if (autoScrollToBottom) {
      infiniteScrollRef.current?.scrollToBottom()
    }
  }, [autoScrollToBottom])

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

  useEffect(() => {
    if (bottomDivRef.current) {
      const observer = new IntersectionObserver((entries) => {
        const [entry] = entries
        setAutoScrollToBottom(!(entry.intersectionRatio < 1))
      })

      observer.observe(bottomDivRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <InfiniteScroll
      ref={infiniteScrollRef}
      className="p-4 w-[var(--chat-width)] mx-auto relative"
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
      <div>
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
        <div ref={bottomDivRef} className="h-[1px] w-full"></div>
      </div>
      <Button
        className={`sticky left-1/2 bottom-4 -translate-x-1/2 ${autoScrollToBottom ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        shape="circle"
        icon={<ArrowDownOutlined />}
        onClick={() => {
          infiniteScrollRef.current?.scrollToBottom()
        }}
      />
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
