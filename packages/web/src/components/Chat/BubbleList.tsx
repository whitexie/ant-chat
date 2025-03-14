import type { ConversationsId, IConversations, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleContent } from '@/types/global'
import { Role } from '@/constants'
import { deleteMessageAction, refreshRequestAction } from '@/store/conversation'
import { getFeatures } from '@/store/features'
import { clipboardWriteText, formatTime } from '@/utils'
import { RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Bubble } from '@ant-design/x'
import { App, Typography } from 'antd'
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
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true)

  const handleScroll = () => {
    const container = divRef.current?.parentElement
    if (!container)
      return

    const { scrollTop, scrollHeight, clientHeight } = container
    const isAtBottom = Math.abs(scrollHeight - scrollTop - clientHeight) < 20
    setShouldAutoScroll(isAtBottom)
  }

  useEffect(() => {
    const container = divRef.current?.parentElement
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }
    return () => container?.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (shouldAutoScroll) {
      setTimeout(() => {
        if (divRef.current) {
          divRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'end',
          })
        }
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
    <div className="ant-bubble-list-container flex flex-col gap-2 w-[var(--chat-width)] mx-auto">
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
      <div ref={divRef} className="h-1 w-full"></div>
    </div>
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
