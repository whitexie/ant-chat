import type { IImageContent, IMessage, ITextContent } from '@/db/interface'
import type { SSEOutput } from '@/utils/stream'
import type {
  ChatCompletionsCallbacks,
  IModel,
  ServiceConstructorOptions,
} from '../interface'
import type {
  GeminiRequestBody,
  GetModelsResponse,
  ModelContent,
  UserContent,
} from './interface'
import Stream from '@/utils/stream'
import BaseService from '../base'

const DEFAULT_STREAM_SEPARATOR = '\r\n\r\n'
const DEFAULT_PART_SEPARATOR = '\r\n'

const DEFAULT_OPTIONS = {
  apiHost: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: '',
  model: 'gemini-1.5-flash-latest',
  temperature: 0.7,
}

class GeminiService extends BaseService {
  constructor(options?: Partial<ServiceConstructorOptions>) {
    const _options = Object.assign({ ...DEFAULT_OPTIONS }, options)
    super(_options)
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

  private transformImage(item: (ITextContent | IImageContent)[]) {
    return item.map((item) => {
      if (item.type === 'image_url') {
        const [, data] = item.image_url.url.split(';base64,')
        return { inlineData: { mimeType: item.image_url.type, data } }
      }
      return { text: item.text }
    })
  }

  transformMessages(messages: IMessage[]) {
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

  async sendChatCompletions(messages: IMessage[], callbacks?: ChatCompletionsCallbacks, addAbortCallback?: (abort: () => void) => void) {
    this.validator()

    const abortController = new AbortController()

    addAbortCallback?.(() => abortController.abort())

    const url = `${this.apiHost}/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Accept': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
      signal: abortController.signal,
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

    const stream = Stream({ readableStream: response.body!, DEFAULT_STREAM_SEPARATOR, DEFAULT_PART_SEPARATOR })

    const reader = stream.getReader()

    addAbortCallback?.(() => {
      reader.cancel()
    })

    this.parseSse(reader, callbacks)
  }

  transformRequestBody(_messages: IMessage[]): GeminiRequestBody {
    const body = this.transformMessages(_messages)
    body.generationConfig = {
      temperature: this.temperature,
    }
    return body
  }

  extractContent(output: unknown): string {
    const json = JSON.parse((output as SSEOutput).data)
    const content = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return content
  }
}

export default GeminiService
