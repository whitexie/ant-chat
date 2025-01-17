import type { ChatMessage } from '@/hooks/useChat'
import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import type { MessageInfo } from '@ant-design/x/es/useXChat'
import { DEFAULT_TITLE, Role } from '@/constants'
import { useActiveConversationIdContext } from '@/contexts/ActiveConversationId'
import { useChat } from '@/hooks/useChat'
import { useConversationStore } from '@/stores/conversations'
import { createConversation } from '@/stores/conversations/reducer'
import { getNow, uuid } from '@/utils'
import { Bubble } from '@ant-design/x'
import { lazy, useEffect, useRef } from 'react'
import ChatSender from './ChatSender'
import { roles } from './roles'

const RenderMarkdown = lazy(() => import('./RenderMarkdown'))

function messageRender(content: API.MessageContent): React.ReactNode {
  if (typeof content === 'string') {
    return <span>{content}</span>
  }

  const images = content.filter(item => item.type === 'image_url')
  const texts = content.filter(item => item.type === 'text')

  return (
    <div>
      <div className="flex gap-1 overflow-x-auto">
        {images.map(item => (
          <img
            key={item.image_url.uid}
            className="object-contain border-solid border-gray-100 rounded-md"
            src={item.image_url.url}
            alt={item.image_url.name}
            width={100}
            height={100}
          />
        ))}
      </div>
      <hr className="my-2" />
      {texts.map((item, index) => (
        <div key={index}>{item.text}</div>
      ))}
    </div>
  )
}

export default function Chat() {
  const [conversations, dispatch] = useConversationStore()
  const [activeId, udpateActiveId] = useActiveConversationIdContext()
  const currentConversation = useRef<IConversation | null>(null)
  const { agent, messages, onRequest, setMessages } = useChat({
    onSuccess: (message) => {
      dispatch!({ type: 'addMessage', id: currentConversation.current?.id || activeId, item: message })
    },
  })

  const items = messages.map((msg) => {
    const { id: key, message: { role, content } } = msg
    const styles = { content: { maxWidth: '60%' } }
    const item: BubbleDataType = { role, content, styles, key, messageRender }

    if (item.role === Role.AI) {
      item.messageRender = (content: string) => <RenderMarkdown content={content} />
    }

    return item
  })

  function onSubmit(message: string, images: API.IImage[]) {
    const messageItem: ChatMessage = {
      id: uuid(),
      role: Role.USER,
      content: message,
      createAt: getNow(),
    }

    if (images.length) {
      const content: (API.ImageContent | API.TextContent)[] = images.map((item) => {
        return {
          type: 'image_url',
          image_url: { ...item },
        }
      })
      content.push({ type: 'text', text: message })
      messageItem.content = content
    }

    onRequest(messageItem)

    // 如果当前没有活跃的会话，则创建一个默认的会话
    if (!activeId && dispatch && udpateActiveId) {
      const item = createConversation({ title: DEFAULT_TITLE })
      dispatch({ type: 'add', item })
      udpateActiveId(item.id)
      currentConversation.current = item
    }
    dispatch!({ type: 'addMessage', id: currentConversation.current?.id || activeId, item: messageItem })
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
        <div className="py-2">
          <Bubble.List
            items={items}
            roles={roles}
            className="h-[var(--bubbleListHeight)] scroll-hidden"
          />
        </div>
      </div>
      <div className="w-full p-2 flex-shrink-0 w-full h-[72px] relative">
        <ChatSender
          loading={agent.isRequesting()}
          onSubmit={(message, images) => onSubmit(message, images)}
        />
      </div>
    </div>
  )
}
