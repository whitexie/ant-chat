import { Stream } from '@/utils'

interface GeminiOptions {
  apiHost?: string
  apiKey: string
  model?: string
}

interface TextPart {
  text: string
}

interface ImagePart {
  inlineData: {
    mimeType: string
    data: string
  }
}

type Part = TextPart | ImagePart

interface UserContent {
  role: 'user'
  parts: Part[]
}

interface ModelContent {
  role: 'model'
  parts: TextPart[]
}

interface GeminiRequestBody {
  contents: (UserContent | ModelContent)[]
  system_instruction?: {
    parts: TextPart[]
  }
  tools?: [
    { googleSearch: object },
  ]
}

interface ChatCompletionsCallbacks {
  onUpdate?: (message: string) => void
  onSuccess?: (message: string) => void
  onError?: (message: Error) => void
}

const DEFAULT_API_HOST = 'https://ysansan-gemini.deno.dev/v1beta'
const DEFAULT_MODEL = 'gemini-1.5-flash-latest'

const DEFAULT_STREAM_SEPARATOR = '\r\n\r\n'
const DEFAULT_PART_SEPARATOR = '\r\n'

class GeminiService {
  private apiHost: string
  private apiKey: string
  private model: string

  constructor(options?: GeminiOptions) {
    this.apiHost = options?.apiHost || DEFAULT_API_HOST
    this.apiKey = options?.apiKey || ''
    this.model = options?.model || DEFAULT_MODEL
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

  transformImage(item: (API.TextContent | API.ImageContent)[]) {
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

    // const { abort, signal } = new AbortController()

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
      // signal,
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

    await parseSse(response.body!, callbacks)
  }
}

export default GeminiService

async function parseSse(readableStream: ReadableStream, callbacks?: ChatCompletionsCallbacks) {
  let __content__ = ''

  for await (const chunk of Stream({ readableStream, DEFAULT_STREAM_SEPARATOR, DEFAULT_PART_SEPARATOR })) {
    if (!chunk.data)
      continue

    try {
      const json = JSON.parse(chunk.data)
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (content) {
        __content__ += content
        // console.log('onupdate => ', __content__)
        callbacks?.onUpdate?.(__content__)
      }
    }
    catch (e) {
      const error = e as Error
      if (!chunk.data.includes('[DONE]')) {
        console.error('parse Stream error', error)
      }
      callbacks?.onError?.(error)
    }
  }

  // console.log('onSuccess => ', __content__)
  callbacks?.onSuccess?.(__content__)

  return __content__
}
