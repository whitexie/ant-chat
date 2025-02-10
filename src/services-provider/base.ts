import type { IMessage } from '@/db/interface'
import type { SSEOutput } from '@/utils/stream'
import type {
  ChatCompletionsCallbacks,
  IModel,
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

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  setApiHost(apiHost: string) {
    this.apiHost = apiHost
  }

  setModel(model: string) {
    this.model = model
  }

  async parseSse(reader: ReadableStreamDefaultReader<SSEOutput>, callbacks?: ChatCompletionsCallbacks) {
    let __content__ = ''

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          callbacks?.onSuccess?.(__content__)
          break
        }

        if (value) {
          __content__ += this.extractContent(value)
          callbacks?.onUpdate?.(__content__)
        }
      }
    }
    catch (e) {
      const error = e as Error
      callbacks?.onError?.(error)
    }
  }

  abstract extractContent(output: unknown): string

  abstract getModels(_apiHost: string, _apiKey: string): Promise<IModel[]>

  abstract transformRequestBody(messages: IMessage[]): unknown

  abstract sendChatCompletions(messages: IMessage[], callbacks?: ChatCompletionsCallbacks, addAbortCallback?: (callback: () => void) => void): Promise<void>
}
