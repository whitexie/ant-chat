import type { IMessage } from '@/db/interface'
import type { SSEOutput } from '@/utils/stream'
import type {
  IModel,
  SendChatCompletionsOptions,
  ServiceConstructorOptions,
} from '../interface'
import type { ImageContent, MessageItem, TextContent } from './interface'
import { Stream } from '@/utils'
import BaseService from '../base'

interface OpenAIRequestBody {
  model: string
  messages: MessageItem[]
  stream: boolean
  temperature?: number
}

interface ModelsResponse {
  object: 'list'
  data: IModel[]
}

const DEFAULT_OPTIONS = {
  apiHost: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  apiKey: '',
  temperature: 0.7,
}

export default class OpenAIService extends BaseService {
  constructor(options?: Partial<ServiceConstructorOptions>) {
    const _options = Object.assign({ ...DEFAULT_OPTIONS }, options)
    super(_options)
  }

  async getModels(apiHost: string, apiKey: string): Promise<IModel[]> {
    const url = `${apiHost}/models`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }

    return ((await response.json()) as ModelsResponse).data
  }

  transformMessages(_messages: IMessage[]): MessageItem[] {
    // const hasImage = hasImageMessages(_messages)
    const isHasFile = _messages.some(message => message.images.length > 0 || message.attachments.length > 0)
    return _messages.map(message => transformMessageItem(message, isHasFile))
  }

  extractContent(output: SSEOutput) {
    const result = {
      message: '',
      reasoningContent: '',
    }
    try {
      const json = JSON.parse(output.data)
      result.message = json.choices?.[0]?.delta?.content || ''
      result.reasoningContent = json.choices?.[0]?.delta?.reasoning_content || ''
    }
    catch (e) {
      console.log('extractContent error => ', e)
    }
    return result
  }

  transformRequestBody(_messages: IMessage[]): OpenAIRequestBody {
    return {
      model: this.model,
      messages: this.transformMessages(_messages),
      stream: true,
      temperature: this.temperature,
    }
  }

  async sendChatCompletions(_messages: IMessage[], options?: SendChatCompletionsOptions) {
    this.validator()
    const { callbacks, addAbortCallback } = options || {}
    const messages = this.transformMessages(_messages)
    const response = await fetch(`${this.apiHost}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model: this.model,
        stream: true,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        const error = new Error('Too Many Requests(HTTP status 429)')
        callbacks?.onError?.(error)
      }
      else if (response.statusText.startsWith('4')) {
        const json = await response.json()
        const error = new Error(json.error.message)
        callbacks?.onError?.(error)
      }
      else {
        const error = new Error(`Failed to fetch ${response.statusText}`)
        callbacks?.onError?.(error)
      }
    }

    const stream = Stream({ readableStream: response.body! })

    const reader = stream.getReader()

    addAbortCallback?.(() => {
      reader.cancel()
    })

    await this.parseSse(reader, callbacks)
  }
}

function transformMessageItem(message: IMessage, isHasFile: boolean): MessageItem {
  if (!isHasFile) {
    return { role: message.role, content: message.content }
  }

  const content: (TextContent | ImageContent)[] = [
    { type: 'text', text: message.content },
  ]

  const imageMessages: ImageContent[] = message.images.map((item) => {
    return { type: 'image_url', image_url: { url: item.data } }
  })

  content.push(...imageMessages)

  return { role: message.role, content }
}
