import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { Role } from '@/constants'
import { activeConversationSelector, useConversationsStore } from '@/store/conversation'
import { getNow, uuid } from '@/utils'
import { Bubble } from '@ant-design/x'
import { useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import ChatSender from './ChatSender'
import MessageContent from './MessageContent'
import RenderMarkdown from './RenderMarkdown'
import { roles } from './roles'

function messageRender(content: API.MessageContent): React.ReactNode {
  return <MessageContent content={content} />
}

export default function Chat() {
  const abortRef = useRef<() => void>(() => {})
  const [isLoading, setIsLoading] = useState(false)
  const { activeConversation, onRequest } = useConversationsStore(useShallow(activeConversationSelector))
  const activeConversationId = activeConversation?.id || ''
  const currentConversation = activeConversation

  const messages = currentConversation?.messages || []

  const bubbleList = useMemo(() => {
    return messages.map((msg) => {
      const { id: key, role, content } = msg
      const styles = { content: { maxWidth: '60%' } }
      const item: BubbleDataType = { role, content, styles, key, messageRender }

      if (item.role === Role.AI) {
        item.messageRender = (content: string) => <RenderMarkdown content={content} />
      }

      return item
    })
  }, [messages])

  async function onSubmit(message: string, images: API.IImage[]) {
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

    // addMessage(activeConversationId, messageItem)

    // 发送请求
    setIsLoading(true)

    await onRequest(activeConversationId, messageItem)

    // TODO model为空
    // const { response, abort } = await chatCompletions([...messages, messageItem], '')
    // const readableStream = response.body!

    // abortRef.current = abort

    // let content = ''
    // const id = `AI-${uuid()}`
    // const createAt = getNow()

    // addMessage(activeConversationId, { id, role: Role.AI, content, createAt })

    // for await (const chunk of Stream({ readableStream })) {
    //   if (!chunk.data)
    //     continue

    //   try {
    //     const json = JSON.parse(chunk.data)
    //     if (json.choices[0].delta.content) {
    //       content += json.choices[0].delta.content
    //       updateMessage(activeConversationId, id, { id, role: Role.AI, content, createAt })
    //     }
    //   }
    //   catch (error) {
    //     if (!chunk.data.includes('[DONE]')) {
    //       console.error(error)
    //       console.error('parse fail line => ', JSON.stringify(chunk))
    //     }
    //   }
    // }

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col h-full w-full max-w-4xl m-auto p-1">
      <div className="flex-1 overflow-y-auto">
        <div className="py-2">
          <Bubble.List
            items={bubbleList}
            roles={roles}
            className="h-[var(--bubbleListHeight)] scroll-hidden"
          />
        </div>
      </div>
      <div className="w-full p-2 flex-shrink-0 w-full h-[72px] relative">
        <ChatSender
          loading={isLoading}
          onSubmit={(message, images) => onSubmit(message, images)}
          onCancel={() => {
            abortRef.current()
            setIsLoading(false)
          }}
        />
      </div>
    </div>
  )
}
