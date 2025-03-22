import type { ConversationsId, IMessage, ModelConfig } from '@/db/interface'
import type { ImperativeHandleRef } from '../InfiniteScroll'
import { Role } from '@/constants'
import { getFeatures } from '@/store/features'
import { deleteMessageAction, nextPageMessagesAction, refreshRequestAction, useMessagesStore } from '@/store/messages'
import { clipboardWriteText, formatTime } from '@/utils'
import { ArrowDownOutlined, RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Button } from 'antd'
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
  const infiniteScrollRef = useRef<ImperativeHandleRef>(null)
  const bottomDivRef = useRef<HTMLDivElement>(null)
  // const [autoScrollToBottom, setAutoScrollToBottom] = useState(true)
  const autoScrollToBottom = useRef(true)
  const [isLoading, setIsLoading] = useState(false)
  // const pageIndex = useMessagesStore(state => state.pageIndex)
  const requestStatus = useMessagesStore(state => state.requestStatus)
  const messageTotal = useMessagesStore(state => state.messageTotal)

  const hasMore = messages.length < messageTotal

  // 自动滚动到最底部
  useEffect(() => {
    if (autoScrollToBottom.current) {
      infiniteScrollRef.current?.scrollToBottom()
    }
  })

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
      const observer = new IntersectionObserver(
        (entries) => {
          const [entry] = entries

          console.log(autoScrollToBottom.current, requestStatus, entry.intersectionRatio)
          if (autoScrollToBottom && requestStatus === 'loading') {
            return
          }

          autoScrollToBottom.current = entry.intersectionRatio > 0
        },
        {
          root: infiniteScrollRef.current?.containerRef.current,
        },
      )

      observer.observe(bottomDivRef.current)

      return () => {
        observer.disconnect()
      }
    }
  }, [])

  return (
    <InfiniteScroll
      ref={infiniteScrollRef}
      className="px-4 w-[var(--chat-width)] mx-auto relative"
      hasMore={hasMore}
      loading={isLoading}
      onLoadMore={handleLoadMore}
      direction="top"
      loadingComponent={(
        <div className="flex justify-center py-2">
          <Loading />
        </div>
      )}
    >
      <div>
        {messages.map(msg => (
          <Bubble
            key={msg.id}
            loading={msg.status === 'loading'}
            placement={msg.role === Role.USER ? 'end' : 'start'}
            style={{
              marginInlineEnd: msg.role === Role.USER ? 10 : 44,
              marginInlineStart: msg.role === Role.USER ? 44 : 10,
            }}
            avatar={getRoleAvatar(msg.role)}
            messageRender={() => (
              <MessageContent
                images={msg.images}
                attachments={msg.attachments}
                content={msg.content}
                reasoningContent={msg.reasoningContent || ''}
                status={msg.status || 'success'}
              />
            )}
            content={msg.content}
            header={<div className="text-xs flex items-center">{formatTime(msg.createAt)}</div>}
            footer={<BubbleFooter message={msg} onClick={handleFooterButtonClick} />}
            typing={msg.status === 'typing' ? { step: 1, interval: 50 } : false}
          />
        ))}

        <div ref={bottomDivRef} className="h-8">
          <Button
            size="small"
            className={`sticky left-1/2 bottom-4 -translate-x-1/2 ${autoScrollToBottom ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
            shape="circle"
            icon={<ArrowDownOutlined />}
            onClick={() => {
              infiniteScrollRef.current?.scrollToBottom()
            }}
          />
        </div>
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
