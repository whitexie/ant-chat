import type {
  ChatCompletionsCallbacks,
  ServiceConstructorOptions,
} from './interface'

export default abstract class BaseService<TransformRequestBodyResult> {
  protected apiHost: string
  protected apiKey: string
  protected model: string

  constructor(options: ServiceConstructorOptions) {
    this.apiHost = options.apiHost
    this.apiKey = options.apiKey
    this.model = options.model
  }

  validator() {
    if (!this.apiKey) {
      throw new Error('apiKey is required')
    }
    if (!this.model) {
      throw new Error('model is required')
    }
    if (!this.apiHost) {
      throw new Error('apiHost is required')
    }
  }

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  setApiHost(apiHost: string) {
    this.apiHost = apiHost
  }

  setModel(model: string) {
    this.model = model
  }

  abstract getModels(_apiHost: string, _apiKey: string): Promise<API.ChatModel[]>

  abstract transformRequestBody(messages: ChatMessage[]): TransformRequestBodyResult

  abstract sendChatCompletions(messages: ChatMessage[], callbacks?: ChatCompletionsCallbacks): Promise<void>
}
