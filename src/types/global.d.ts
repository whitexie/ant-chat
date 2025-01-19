type CreateAt = number

interface IConversation {
  id: string
  title: string
  messages: ChatMessage[]
  createAt: CreateAt
}

interface ChatMessage {
  id: string
  role: Role
  content: API.MessageContent
  createAt: CreateAt
}

interface ModelConfig {
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}
