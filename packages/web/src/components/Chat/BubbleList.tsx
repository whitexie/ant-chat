import type { ConversationsId, IMessage, IMessageAI, MessageId, ModelConfig } from '@/db/interface'
import type { BubbleContent } from '@/types/global'
import type { BubbleProps } from '@ant-design/x'
import type { AvatarProps } from 'antd'
import type { ImperativeHandleRef } from '../InfiniteScroll'
import { Role } from '@/constants'
import { getFeatures } from '@/store/features'
import { deleteMessageAction, executeMcpToolAction, nextPageMessagesAction, refreshRequestAction, useMessagesStore } from '@/store/messages'
import { clipboardWriteText } from '@/utils'
import { ArrowDownOutlined, RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Button } from 'antd'
import { pick } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'react'
import { InfiniteScroll } from '../InfiniteScroll'
import Loading from '../Loading'
import BubbleFooter from './BubbleFooter'

import { BubbleHeader } from './BubbleHeader'
import { McpToolCallPanel } from './McpToolCallPanel'
import MessageContent from './MessageContent'
import { getProviderLogo } from './providerLogo'

interface Props {
  messages: IMessage[]
  conversationsId: string
  config: ModelConfig
  onExecuteAllCompleted?: (messageId: MessageId) => void
}

function BubbleList({ config, messages, conversationsId, onExecuteAllCompleted }: Props) {
  const { message: messageFunc } = App.useApp()

  // ============================ transform Bubble ============================
  const items: React.ReactNode[] = []

  for (const msg of messages) {
    const commonProps: Partial<BubbleProps> = {
      loading: msg.status === 'loading',
      placement: msg.role === Role.USER ? 'end' : 'start',
      avatar: getRoleAvatar(msg),
      typing: msg.status === 'typing' ? { step: 1, interval: 50 } : false,
    }

    if ((msg.role === Role.AI) && msg.mcpTool) {
      commonProps.styles = {
        content: {
          width: 'calc(100% - 44px)',
        },
      }
    }

    items.push(
      <Bubble
        key={msg.id}
        {...commonProps}
        messageRender={(content) => {
          if (msg.role !== Role.AI) {
            const pickList = ['content', 'status']
            if (msg.role === Role.USER) {
              pickList.push('images', 'attachments')
            }
            const messageContentProps: Partial<BubbleContent> = pick(msg, pickList)
            // console.log('messageContentProps => ', JSON.stringify(messageContentProps))

            return <MessageContent {...messageContentProps} />
          }
          else {
            return (
              <>
                <MessageContent
                  content={content}
                  reasoningContent={msg.reasoningContent}
                  status={msg.status}
                />
                {
                  msg.role === Role.AI && msg.mcpTool && (
                    <div className="flex flex-col gap-4 mt-3">
                      {
                        msg.mcpTool?.map(tool => (
                          <McpToolCallPanel
                            key={tool.id}
                            item={tool}
                            onExecute={async (item) => {
                              const { isAllCompleted } = await executeMcpToolAction(msg.id, item)

                              if (isAllCompleted) {
                                onExecuteAllCompleted?.(msg.id)
                              }
                            }}
                          />
                        ))
                      }
                    </div>
                  )
                }
              </>
            )
          }
        }}
        content={

          typeof msg.content === 'string'
            ? msg.content
            : msg.content.reduce((a, b) => {
                if (b.type === 'image') {
                  return `${a}\n![](data:${b.mimeType};base64,${b.data})\n`
                }
                else {
                  return `${a}\n${b.text}`
                }
              }, '')

        }
        header={<BubbleHeader time={msg.createAt} modelInfo={msg.role === Role.AI ? msg.modelInfo : undefined} />}
        footer={<BubbleFooter message={msg} onClick={handleFooterButtonClick} />}
      />,
    )
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
        className={`sticky block w-6 min-h-6 left-1/2 bottom-8 -translate-x-1/2 transition-opacity duration-300 ${autoScrollToBottom ? 'opacity-0' : 'opacity-100'}`}
        shape="circle"
        icon={<ArrowDownOutlined />}
        onClick={() => {
          infiniteScrollRef.current?.scrollToBottom()
        }}
      />
    </InfiniteScroll>
  )
}

function getRoleAvatar({ role, ...rest }: IMessage): AvatarProps {
  const defaultConfig = { icon: <RobotFilled />, className: 'bg-[#69b1ff]' }
  if (role === Role.USER) {
    return { icon: <UserOutlined />, className: 'bg-[#87d068]' }
  }
  else if (role === Role.SYSTEM) {
    return { icon: <SmileFilled />, className: 'bg-[#DE732D]' }
  }
  else if (role === Role.AI) {
    /** Role.AI */

    const { modelInfo } = rest as IMessageAI
    if (!modelInfo) {
      return defaultConfig
    }

    const provider = modelInfo?.provider.toLowerCase()

    const ProviderLogo = getProviderLogo(provider || '')
    if (ProviderLogo) {
      return { icon: <ProviderLogo />, className: 'bg-white dark:bg-black border-solid border-black/10 dark:border-dark' }
    }

    return defaultConfig
  }

  return defaultConfig
}

export default BubbleList
