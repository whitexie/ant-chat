import type { ConversationsId, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleProps } from '@ant-design/x'
import type { ImperativeHandleRef } from '../InfiniteScroll'
import { Role } from '@/constants'
import { getFeatures } from '@/store/features'
import { deleteMessageAction, nextPageMessagesAction, refreshRequestAction, useMessagesStore } from '@/store/messages'
import { clipboardWriteText } from '@/utils'
import { ArrowDownOutlined, RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Button } from 'antd'
import { useCallback, useEffect, useRef, useState } from 'react'
import { InfiniteScroll } from '../InfiniteScroll'
import Loading from '../Loading'
import BubbleFooter from './BubbleFooter'
import { BubbleHeader } from './BubbleHeader'
import MessageContent from './MessageContent'

interface Props {
  messages: IMessage[]
  conversationsId: string
  config: ModelConfig
}

function BubbleList({ config, messages, conversationsId }: Props) {
  const { message: messageFunc } = App.useApp()

  // ============================ transform Bubble ============================
  const items: React.ReactNode[] = []

  for (const msg of messages) {
    const commonProps: Partial<BubbleProps> = {
      loading: msg.status === 'loading',
      placement: msg.role === Role.USER ? 'end' : 'start',
      style: {
        marginInlineEnd: msg.role === Role.USER ? 10 : 44,
        marginInlineStart: msg.role === Role.USER ? 44 : 10,
      },
      avatar: getRoleAvatar(msg.role),
    }

    if (msg.type === 'question') {
      items.push(
        <Bubble
          key={msg.id}
          {...commonProps}
          styles={{
            content: {
              backgroundColor: 'transparent',
              padding: 0,
            },
          }}
          header={<BubbleHeader time={msg.createAt} />}
          messageRender={() => (
            <>
              <MessageContent
                content=" "
                reasoningContent={msg.reasoningContent}
              />
              <div className="mt-3">
                <div className="text-sm font-medium text-gray-800 dark:text-gray-200 bg-gray-100 dark:bg-gray-700/80 rounded-lg px-4 py-3 shadow-sm border border-gray-200 dark:border-gray-600">
                  {msg.question}
                </div>
              </div>
            </>
          )}
        />,
      )

      if (msg.answer) {
        items.push(
          <Bubble
            key={`${msg.id}-answer`}
            {...commonProps}
            role={Role.USER}
            placement="end"
            avatar={getRoleAvatar(Role.USER)}
            content={msg.answer}
            messageRender={() => <MessageContent content={msg.answer} />}
            header={<BubbleHeader time={msg.answerAt} />}
          />,
        )
      }
    }
    else if (msg.type === 'use_mcp_tool') {
      <Bubble
        key={msg.id}
        loading={msg.status === 'loading'}
      />
    }
    else {
      items.push(
        <Bubble
          key={msg.id}
          loading={msg.status === 'loading'}
          placement={msg.role === Role.USER ? 'end' : 'start'}
          style={{
            marginInlineEnd: msg.role === Role.USER ? 10 : 44,
            marginInlineStart: msg.role === Role.USER ? 44 : 10,
          }}
          avatar={getRoleAvatar(msg.role)}
          messageRender={content => (
            <MessageContent
              images={msg.images}
              attachments={msg.attachments}
              content={content}
              reasoningContent={msg.reasoningContent || ''}
              status={msg.status || 'success'}
            />
          )}
          content={msg.content}
          header={<BubbleHeader time={msg.createAt} />}
          footer={<BubbleFooter message={msg} onClick={handleFooterButtonClick} />}
          typing={msg.status === 'typing' ? { step: 1, interval: 50 } : false}
        />,
      )
    }
  }

  // ============================ 自动滚动 ============================
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(true)
  const infiniteScrollRef = useRef<ImperativeHandleRef>(null)

  function handleScroll(e: React.UIEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement
    setAutoScrollToBottom(
      target.scrollHeight - Math.abs(target.scrollTop) - target.clientHeight <= 1,
    )
  }

  async function handleFooterButtonClick(buttonName: string, message: IMessage) {
    const mapping = {
      copy: () => copyMessage(message),
      refresh: () => refreshRequestAction(conversationsId as ConversationsId, message, config, getFeatures()),
      delete: () => deleteMessageAction(message.id),
    }
    mapping[buttonName as keyof typeof mapping]?.()
  }

  // 自动滚动到最底部
  useEffect(() => {
    if (autoScrollToBottom) {
      infiniteScrollRef.current?.scrollToBottom()
    }
  })

  useEffect(() => {
    if (autoScrollToBottom) {
      infiniteScrollRef.current?.scrollToBottom()
    }
  }, [messages.length])

  //  ============================ 分页 ============================
  const [isLoading, setIsLoading] = useState(false)
  const messageTotal = useMessagesStore(state => state.messageTotal)
  const hasMore = messages.length < messageTotal

  const handleLoadMore = useCallback(async () => {
    setIsLoading(true)
    try {
      await nextPageMessagesAction(conversationsId as ConversationsId)
    }
    finally {
      setIsLoading(false)
    }
  }, [conversationsId])

  // ============================ 操作 ============================
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

  return (
    <InfiniteScroll
      ref={infiniteScrollRef}
      className="px-4 w-[var(--chat-width)] flex flex-col gap-4 mx-auto relative"
      hasMore={hasMore}
      loading={isLoading}
      onLoadMore={handleLoadMore}
      direction="top"
      loadingComponent={(
        <div className="flex justify-center py-2">
          <Loading />
        </div>
      )}
      onScroll={handleScroll}
    >
      {items}
      <Button
        size="small"
        className={`sticky left-1/2 bottom-8 -translate-x-1/2 transition-opacity duration-300 ${autoScrollToBottom ? 'opacity-0' : 'opacity-100'}`}
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
