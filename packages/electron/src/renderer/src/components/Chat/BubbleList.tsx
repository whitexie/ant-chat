import type { ConversationsId, IMessage, IMessageAI, MessageId, ModelConfig } from '@ant-chat/shared'
import type { BubbleProps } from '@ant-design/x'
import type { ImperativeHandleRef } from '../InfiniteScroll'
import type { BubbleContent } from '@/types/global'
import { ArrowDownOutlined, RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Button } from 'antd'
import { pick } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Role } from '@/constants'
import { getFeatures } from '@/store/features'
import { deleteMessageAction, executeMcpToolAction, nextPageMessagesAction, refreshRequestAction, useMessagesStore } from '@/store/messages'
import { clipboardWrite } from '@/utils'
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

const leftBubbleContentStyle: React.CSSProperties = {
  marginRight: '44px',
}

const rightBubbleContentStyle: React.CSSProperties = {
  marginLeft: '44px',
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
      className: 'group',
      typing: msg.status === 'typing' ? { step: 1, interval: 50 } : false,
      styles: { content: msg.role === Role.USER ? { ...rightBubbleContentStyle } : { ...leftBubbleContentStyle } },
    }

    if (msg.role === Role.AI) {
      if (msg?.mcpTool?.length) {
        commonProps.styles = {
          content: {
            width: 'calc(100% - 44px)',
          },
        }
      }
    }

    items.push(
      <Bubble
        key={msg.id}
        {...commonProps}
        messageRender={(content) => {
          if (msg.role !== Role.AI) {
            const pickList = ['status']
            if (msg.role === Role.USER) {
              pickList.push('images', 'attachments')
            }
            const messageContentProps: Partial<BubbleContent> = { ...pick(msg, pickList), content }
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
        header={<BubbleHeader time={msg.createdAt} modelInfo={msg.role === Role.AI ? msg.modelInfo : undefined} />}
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
    const data = { text: '', html: '' }
    message.content.forEach((b) => {
      if (b.type === 'image') {
        // data.html += `\n<div><img src="data:${b.mimeType};base64,${b.data}" /></div>\n`
        data.text += `\n![](data:${b.mimeType};base64,${b.data})\n`
      }
      else {
        // data.html += `\n<p>${b.text}</p>\n`
        data.text += b.text
      }
    })

    try {
      await clipboardWrite(data)
      messageFunc.success('复制成功')
    }
    catch {
      messageFunc.error('复制失败')
    }
  }

  return (
    <InfiniteScroll
      ref={infiniteScrollRef}
      className="flex flex-col gap-4 mx-auto relative px-4 w-(--chat-width)"
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
        className={`!sticky block w-6 min-h-6 left-1/2 bottom-8 -translate-x-1/2 transition-opacity duration-300 ${autoScrollToBottom ? 'opacity-0' : 'opacity-100'}`}
        shape="circle"
        icon={<ArrowDownOutlined />}
        onClick={() => {
          infiniteScrollRef.current?.scrollToBottom()
        }}
      />
    </InfiniteScroll>
  )
}

function getRoleAvatar({ role, ...rest }: IMessage): React.ReactElement {
  const defaultAvatar = (
    <div className="w-8 h-8 flex items-center justify-center text-white text-lg bg-[#69b1ff] rounded-full">
      <RobotFilled />
    </div>
  )

  if (role === Role.USER) {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-white text-lg bg-[#87d068] rounded-full">
        <UserOutlined />
      </div>
    )
  }
  else if (role === Role.SYSTEM) {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-white text-lg bg-[#DE732D] rounded-full">
        <SmileFilled />
      </div>
    )
  }
  else if (role === Role.AI) {
    /** Role.AI */

    const { modelInfo } = rest as IMessageAI
    if (!modelInfo) {
      return defaultAvatar
    }

    const provider = modelInfo?.provider.toLowerCase()

    const ProviderLogo = getProviderLogo(provider || '')
    if (ProviderLogo) {
      return (
        <div className="w-8 h-8 flex items-center justify-center text-white dark:bg-black border-solid text-lg border-black/10 dark:border-white/20 border-1 bg-white rounded-full">
          <ProviderLogo />
        </div>
      )
    }

    return defaultAvatar
  }

  return defaultAvatar
}

export default BubbleList
