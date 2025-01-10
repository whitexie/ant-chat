import type { XAgent } from '@ant-design/x/es/useXAgent'
import { sendChatMessage } from '@/api'
import { Role } from '@/constants'
import { useAgent } from '@/hooks/useAgent'
import { useXChat, XStream } from '@ant-design/x'

export interface ChatMessage {
  id: string
  role: Role
  content: string
}

interface RequestFnInfo<T> {
  message?: T | undefined
  messages?: T[] | undefined
}

interface RequestFnCallbacks {
  onUpdate: (message: ChatMessage) => void
  onSuccess: (message: ChatMessage) => void
  onError: (error: Error) => void
}

let uuid = 0

async function request(info: RequestFnInfo<ChatMessage>, callbacks: RequestFnCallbacks) {
  if (!info.message || !info.messages) {
    return
  }
  const { messages } = info
  const { onSuccess, onUpdate } = callbacks

  console.log('messages => ', JSON.stringify(messages))

  const { response } = await sendChatMessage(messages, 'deepseek-chat')
  const readableStream = response.body!

  let content = ''
  const id = `AI-${++uuid}`
  for await (const chunk of XStream({ readableStream })) {
    if (!chunk.data) {
      continue
    }
    try {
      const json = JSON.parse(chunk.data)
      if (json.choices[0].delta.content) {
        content += json.choices[0].delta.content
        onUpdate({ id, role: Role.AI, content })
      }
    }
    catch {
      if (!chunk.data.includes('[DONE]')) {
        console.error('parse fail line => ', JSON.stringify(chunk))
      }
    }
  }
  onSuccess({
    id: `AI-${id}`,
    role: Role.AI,
    content,
  })
}
export function useChat() {
  const agent = useAgent<ChatMessage>({ request })[0] as unknown as XAgent<ChatMessage>

  const { onRequest, messages, setMessages } = useXChat({ agent })

  return {
    agent,
    messages,
    setMessages,
    onRequest,
  }
}
