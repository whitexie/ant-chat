type CreateAt = number

interface IConversation {
  id: string
  title: string
  createAt: CreateAt
}

interface ChatMessage {
  id: string
  convId: string
  role: Role
  content: API.MessageContent
  createAt: CreateAt
  status?: 'success' | 'error' | 'loading'
}

interface ModelConfig {
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}

type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
