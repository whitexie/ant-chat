import type {
  ChatCompletionsCallbacks,
  ServiceConstructorOptions,
} from '../interface'
import type { MessageItem } from './interface'
import { pick } from 'lodash-es'
import BaseService from '../base'
import { parseSse } from '../util'

interface OpenAIRequestBody {
  model: string
  messages: MessageItem[]
  stream: boolean
}

interface ModelsResponse {
  object: 'list'
  data: API.ChatModel[]
}

const DEFAULT_OPTIONS = {
  apiHost: 'https://api.openai.com/v1',
  model: 'gpt-4o',
  apiKey: '',
}

export default class OpenAIService extends BaseService<OpenAIRequestBody> {
  constructor(options?: Partial<ServiceConstructorOptions>) {
    const _options = Object.assign({ ...DEFAULT_OPTIONS }, options)
    super(_options)
  }

  async getModels(apiHost: string, apiKey: string): Promise<API.ChatModel[]> {
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

  transformMessages(_messages: ChatMessage[]): MessageItem[] {
    const hasImage = hasImageMessages(_messages)
    return _messages.map(message => transformMessageItem(message, hasImage))
  }

  transformRequestBody(_messages: ChatMessage[]): OpenAIRequestBody {
    return {
      model: this.model,
      messages: this.transformMessages(_messages),
      stream: true,
    }
  }

  async sendChatCompletions(_messages: ChatMessage[], callbacks: ChatCompletionsCallbacks) {
    this.validator()
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
      const error = new Error('Failed to send chat completions')
      callbacks.onError?.(error)
    }

    await parseSse({ readableStream: response.body! }, callbacks)
  }
}

// 新增类型守卫和工具函数
function hasImageMessages(messages: ChatMessage[]): boolean {
  return messages.some(item =>
    Array.isArray(item.content)
    && item.content.some(content => content.type === 'image_url'),
  )
}

function convertTextToContentArray(content: string): MessageItem['content'] {
  return [{ type: 'text', text: content }]
}

function mergeContentArrayToString(contents: Exclude<ChatMessage['content'], string>): string {
  return contents.reduce((acc, content) =>
    content.type === 'text' ? acc + content.text : acc, '')
}

function transformMessageItem(message: ChatMessage, hasImage: boolean): MessageItem {
  const base = { role: message.role }

  if (hasImage) {
    const content: MessageItem['content'] = typeof message.content === 'string'
      ? convertTextToContentArray(message.content)
      : message.content.map((c) => {
          if (c.type === 'image_url') {
            return {
              type: c.type,
              image_url: pick(c.image_url, ['url']), // { url: c.image_url.url },
            }
          }
          return pick(c, ['type', 'text'])
        })
    return { ...base, content }
  }

  const content = typeof message.content === 'string'
    ? message.content
    : mergeContentArrayToString(message.content)

  return { ...base, content }
}
