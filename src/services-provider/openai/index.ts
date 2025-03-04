import type { IMessage } from '@/db/interface'
import type { SSEOutput, XReadableStream } from '@/utils/stream'
import type {
  ServiceConstructorOptions,
} from '../interface'
import type { ImageContent, MessageItem, TextContent } from './interface'
import { request, Stream } from '@/utils'
import BaseService from '../base'

interface OpenAIRequestBody {
  model: string
  messages: MessageItem[]
  stream: boolean
  temperature?: number
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
      if (!output.data.includes('[DONE]')) {
        console.log('extractContent error => ', e)
      }
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

  async sendChatCompletions(_messages: IMessage[]): Promise<XReadableStream> {
    this.validator()
    const messages = this.transformMessages(_messages)

    const response = await request(`${this.apiHost}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        messages,
        model: this.model,
        stream: true,
        temperature: this.temperature,
      }),
    })

    if (!response.ok) {
      if (response.headers.get('content-type')?.includes('application/json')) {
        const json = await response.json()
        const status = response.status

        throw new Error(`${status} ${json.error.message}`)
      }
      throw new Error(`${response.status} ${response.statusText}`)
    }

    return Stream({ readableStream: response.body! })
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
