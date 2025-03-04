import type { IMessage } from '@/db/interface'
import type { SSEOutput, XReadableStream } from '@/utils/stream'
import type {
  ChatCompletionsCallbacks,
  SendChatCompletionsOptions,
  ServiceConstructorOptions,
} from './interface'

export default abstract class BaseService {
  protected apiHost: string
  protected apiKey: string
  protected model: string
  protected temperature: number = 0.7

  constructor(options: ServiceConstructorOptions) {
    this.apiHost = options.apiHost
    this.apiKey = options.apiKey
    this.model = options.model
    this.temperature = options.temperature
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

  setTemperature(temperature: number) {
    this.temperature = temperature
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

  getApiHost(): string {
    return this.apiHost
  }

  async parseSse(reader: ReadableStreamDefaultReader<SSEOutput>, callbacks?: ChatCompletionsCallbacks) {
    let message = ''
    let reasoningContent = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          callbacks?.onSuccess?.({ message, reasoningContent })
          break
        }

        if (value) {
          const result = this.extractContent(value)
          message += result.message
          reasoningContent += result.reasoningContent
          callbacks?.onUpdate?.({ message, reasoningContent })
        }
      }
    }
    catch (e) {
      const error = e as Error
      callbacks?.onError?.(error)
    }
  }

  abstract extractContent(output: unknown): { message: string, reasoningContent: string }

  abstract transformRequestBody(messages: IMessage[]): unknown

  abstract sendChatCompletions(messages: IMessage[], options?: SendChatCompletionsOptions): Promise<XReadableStream>
}
