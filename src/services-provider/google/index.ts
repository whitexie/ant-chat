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
  system_instruction: {
    parts: TextPart[]
  }
  tools?: [
    { googleSearch: object },
  ]
}

const DEFAULT_API_HOST = 'https://generativelanguage.googleapis.com/v1beta'
const DEFAULT_MODEL = 'gemini-1.5-flash-latest'

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
        return {
          inlineData: {
            mimeType: item.image_url.type,
            data: item.image_url.url,
          },
        }
      }
      return {
        text: item.text,
      }
    })
  }

  transformMessages(messages: ChatMessage[]) {
    const result: GeminiRequestBody = {
      contents: [],
      system_instruction: {
        parts: [],
      },
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
        result.system_instruction.parts.push({ text: msg.content as string })
      }
    })
    return result
  }

  async request(messages: ChatMessage[]) {
    this.validator()

    const { abort, signal } = new AbortController()

    const url = `${this.apiHost}/models/${this.model}:generateContent?alt=sse&key=${this.apiKey}`
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({
        contents: this.transformMessages(messages),
      }),
      signal,
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.statusText}`)
    }

    return { response, abort }
  }
}

export default GeminiService
