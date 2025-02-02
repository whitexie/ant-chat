export interface ServiceConstructorOptions {
  apiHost: string
  apiKey: string
  model: string
}

export interface ChatCompletionsCallbacks {
  onUpdate?: (message: string) => void
  onSuccess?: (message: string) => void
  onError?: (message: Error) => void
}
