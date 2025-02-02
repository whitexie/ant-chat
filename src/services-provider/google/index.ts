import type {
  ChatCompletionsCallbacks,
  ServiceConstructorOptions,
} from '../interface'
import type {
  GeminiRequestBody,
  GetModelsResponse,
  ModelContent,
  UserContent,
} from './interface'
import BaseService from '../base'
import { parseSse } from '../util'

const DEFAULT_API_HOST = 'https://ysansan-gemini.deno.dev/v1beta'
const DEFAULT_MODEL = 'gemini-1.5-flash-latest'

const DEFAULT_STREAM_SEPARATOR = '\r\n\r\n'
const DEFAULT_PART_SEPARATOR = '\r\n'

class GeminiService extends BaseService<GeminiRequestBody> {
  constructor(options?: Partial<ServiceConstructorOptions>) {
    const _options = Object.assign({
      apiHost: DEFAULT_API_HOST,
      apiKey: '',
      model: DEFAULT_MODEL,
    }, options)
    super(_options)
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

  async getModels(apiHost: string, apiKey: string): Promise<IModel[]> {
    const url = `${apiHost}/models?key=${apiKey}`
    const response = await fetch(url, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }
    const data = await response.json() as GetModelsResponse

    return data.models.map((model) => {
      const id = model.name.replace('models/', '')
      return { id, object: 'model', owned_by: 'google' }
    })
  }

  transformImage(item: (TextContent | ImageContent)[]) {
    return item.map((item) => {
      if (item.type === 'image_url') {
        const [, data] = item.image_url.url.split(';base64,')
        return { inlineData: { mimeType: item.image_url.type, data } }
      }
      return { text: item.text }
    })
  }

  transformMessages(messages: ChatMessage[]) {
    const result: GeminiRequestBody = {
      contents: [],
    }

    messages.forEach((msg) => {
      if (msg.role === 'user') {
        const content: UserContent = {
          role: 'user',
          parts: typeof msg.content === 'string' ? [{ text: msg.content }] : this.transformImage(msg.content),
        }
        result.contents.push(content)
      }

      else if (msg.role === 'assistant') {
        const content: ModelContent = {
          role: 'model',
          parts: [{ text: msg.content as string }],
        }
        result.contents.push(content)
      }
      else if (msg.role === 'system') {
        if (!result.system_instruction) {
          result.system_instruction = {
            parts: [],
          }
        }
        result.system_instruction.parts.push({ text: msg.content as string })
      }
    })
    return result
  }

  async sendChatCompletions(messages: ChatMessage[], callbacks?: ChatCompletionsCallbacks) {
    this.validator()

    const url = `${this.apiHost}/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      body: JSON.stringify(this.transformMessages(messages)),
    })

    if (!response.ok) {
      const statusText = `${response.status}`
      if (statusText.startsWith('4') || statusText.startsWith('5')) {
        const json = await response.json()

        throw new Error(`Failed to fetch. ${json.error.message}`)
      }
      else {
        throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
      }
    }

    await parseSse({ readableStream: response.body!, DEFAULT_STREAM_SEPARATOR, DEFAULT_PART_SEPARATOR }, callbacks)
  }

  transformRequestBody(_messages: ChatMessage[]): GeminiRequestBody {
    return this.transformMessages(_messages)
  }
}

export default GeminiService
