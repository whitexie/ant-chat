export interface ServiceConstructorOptions {
  apiHost: string
  apiKey: string
  model: string
  temperature: number
}

export interface ChatCompletionsCallbacks {
  onUpdate?: (message: string) => void
  onSuccess?: (message: string) => void
  onError?: (message: Error) => void
}

export interface IModel {
  id: string
  object: 'model'
  owned_by: string
}
