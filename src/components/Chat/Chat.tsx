import type { ChatMessage } from '@/hooks/useChat'
import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import type { MessageInfo } from '@ant-design/x/es/useXChat'
import RenderMarkdown from '@/components/RenderMarkdown'
import { DEFAULT_TITLE, Role } from '@/constants'
import { useActiveConversationIdContext } from '@/contexts/activeIdConversations'
import { useChat } from '@/hooks/useChat'
import { useConversationStore } from '@/stores/conversations'
import { createConversation } from '@/stores/conversations/reducer'
import { getNow, uuid } from '@/utils'
import { LinkOutlined } from '@ant-design/icons'
import { Bubble, Sender } from '@ant-design/x'
import { Button } from 'antd'
import { useEffect, useRef, useState } from 'react'
import { roles } from './roles'

const prefix = (
  <div className="flex gap-1">
    <Button type="text" icon={<LinkOutlined />} />
  </div>
)

export default function Chat() {
  const [conversations, dispatch] = useConversationStore()
  const [activeId, udpateActiveId] = useActiveConversationIdContext()
  const [message, setMessage] = useState('')
  const { agent, messages, onRequest, setMessages } = useChat({
    onSuccess: (message) => {
      dispatch!({ type: 'addMessage', id: activeId, item: message })
    },
  })

  const currentConversation = useRef<IConversation | null>(null)

  const items = messages.map((msg) => {
    const { id: key, message: { role, content } } = msg
    const styles = { content: { maxWidth: '60%' } }
    const item: BubbleDataType = { role, content, styles, key }

    if (item.role === Role.AI) {
      item.messageRender = (content: string) => <RenderMarkdown content={content} />
    }

    return item
  })

  function onSubmit(message: string) {
    const messageItem: ChatMessage = {
      id: uuid(),
      role: Role.USER,
      content: message,
      createAt: getNow(),
    }
    onRequest(messageItem)
    setMessage('')

    // 如果当前没有活跃的会话，则创建一个默认的会话
    if (!activeId && dispatch && udpateActiveId) {
      const item = createConversation({ title: DEFAULT_TITLE })
      dispatch({ type: 'add', item })
      udpateActiveId(item.id)
    }
    else {
      dispatch!({ type: 'addMessage', id: activeId, item: messageItem })
    }
  }

  useEffect(() => {
    if (activeId === currentConversation.current?.id) {
      return
    }

    currentConversation.current = conversations.find(item => item.id === activeId) || null
    if (currentConversation.current) {
      const messages: MessageInfo<ChatMessage>[] = currentConversation.current.messages.map((msg) => {
        const { id } = msg
        return {
          id,
          message: msg,
          status: msg.role === Role.USER ? 'local' : 'success',
        }
      })

      setMessages(messages)
    }
  }, [activeId, conversations, setMessages])

  return (
    <div className="flex flex-col h-full w-full max-w-4xl m-auto p-1">
      <div className="flex-1 overflow-y-auto">
        <div>
          <Bubble.List items={items} roles={roles} className="h-[var(--bubbleListHeight)] scroll-hidden" />
        </div>
      </div>
      <div className="flex-shrink-0 w-full relative">
        <div className="w-full p-2">
          <Sender
            value={message}
            prefix={prefix}
            onChange={setMessage}
            loading={agent.isRequesting()}
            placeholder="按回车发送，Shift + 回车 换行"
            onSubmit={onSubmit}
          />
        </div>
      </div>
    </div>
  )
}
