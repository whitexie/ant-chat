import type { ConversationsId, IConversations, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleContent } from '@/types/global'
import { Role } from '@/constants'
import { deleteMessageAction, refreshRequestAction } from '@/store/conversation'
import { getFeatures } from '@/store/features'
import { clipboardWriteText, formatTime } from '@/utils'
import { ArrowDownOutlined, RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Button, Typography } from 'antd'
import { useEffect, useRef, useState } from 'react'
import BubbleFooter from './BubbleFooter'
import MessageContent from './MessageContent'

interface BubbleListProps {
  currentConversations: IConversations | undefined
  messages: IMessage[]
  config: ModelConfig
}

function BubbleList({ messages, currentConversations, config }: BubbleListProps) {
  const { message: messageFunc } = App.useApp()
  const activeConversationId = currentConversations?.id || ''
  const divRef = useRef<HTMLDivElement>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const handleScroll = () => {
    const container = getScrollElement(divRef.current)
    if (!container)
      return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20

    if (!isAtBottom && timer.current) {
      clearTimeout(timer.current)
    }
    setShouldAutoScroll(isAtBottom)
  }

  useEffect(() => {
    const container = getScrollElement(divRef.current)
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (shouldAutoScroll) {
      timer.current = setTimeout(() => {
        scrollToBottom(divRef.current)
        setShouldAutoScroll(true)
      }, 100)
    }
  }, [messages, shouldAutoScroll])

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
      refresh: () => refreshRequestAction(activeConversationId as ConversationsId, message, config, getFeatures()),
      delete: () => deleteMessageAction(message.id),
    }
    mapping[buttonName as keyof typeof mapping]?.()
  }

  return (
    <>
      <div ref={divRef} className="ant-bubble-list-container flex flex-col gap-2 w-[var(--chat-width)] mx-auto">
        {
          messages.map((msg) => {
            return (
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
            )
          })
        }
        <Button
          variant="outlined"
          icon={<ArrowDownOutlined />}
          shape="circle"
          className={`left-50% transition-bottom overflow-hidden sticky ${shouldAutoScroll ? 'bottom-0px opacity-0' : 'z-10 bottom-20px'}`}
          onClick={() => {
            scrollToBottom(divRef.current)
            setShouldAutoScroll(true)
          }}
        />
      </div>

    </>
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

function getScrollElement(element: HTMLElement | null) {
  return element?.parentElement
}

function scrollToBottom(element: HTMLElement | null) {
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    })
  }
}
export default BubbleList
