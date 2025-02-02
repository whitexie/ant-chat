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
  name?: string
  apiHost: string
  apiKey: string
  model: string
  temperature: number
  systemMessage: string
}

interface ModelConfigMapping {
  [key in 'Gemini' | 'DeepSeek' | 'openAI']: ModelConfig
  [key: string]: ModelConfig
}

type ModelConfigMappingKey = keyof ModelConfigMapping

interface ModelConfigV2 {
  active: ModelConfigMappingKey
  configMapping: ModelConfigMapping
}

type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>
