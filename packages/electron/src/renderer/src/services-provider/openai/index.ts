import type { IMcpToolCall, IMessage } from '@/db/interface'
import type { SSEOutput, XReadableStream } from '@/utils/stream'
import type {
  ChatCompletionsCallbacks,
  SendChatCompletionsOptions,
  ServiceConstructorOptions,
} from '../interface'
import type {
  ImageContent,
  McpToolRawMapping,
  MessageItem,
  OpenAIRequestBody,
  OpenAIResponse,
  TextContent,
  ToolCallMessage,
  ToolResultMessage,
} from './interface'
import { Role } from '@/constants'
import { createMcpToolCall } from '@/mcp'
import { request, Stream } from '@/utils'
import BaseService from '../base'

const DEFAULT_OPTIONS = {
  apiHost: 'https://api.openai.com/v1',
  model: '',
  apiKey: '',
  temperature: 0.7,
}

export default class OpenAIService extends BaseService {
  /**
   * call_tools的不是一次性全都返回的，需要缓存拼接，等待全部传输完后再进行解析
   */
  mcpToolRawMapping: McpToolRawMapping = {}
  currentToolId = ''

  constructor(options?: Partial<ServiceConstructorOptions>) {
    const _options = Object.assign({ ...DEFAULT_OPTIONS }, options)
    super(_options)
  }

  transformMessages(_messages: IMessage[]): MessageItem[] {
    const isHasFile = _messages.filter(msg => msg.role === Role.USER).some(message => message.images.length > 0 || message.attachments.length > 0)
    const messages: MessageItem[] = []
    _messages.forEach((msg) => {
      messages.push(...transformMessageItem(msg, isHasFile))
    })

    return messages
  }

  extractContent(output: SSEOutput) {
    let reasoningContent = ''
    let message = ''
    const functioncalls: IMcpToolCall[] = []

    try {
      const json = JSON.parse(output.data) as OpenAIResponse
      message += json.choices[0]?.delta?.content || ''
      reasoningContent += json.choices?.[0]?.delta?.reasoning_content || ''

      // 将tool_calls 相关的内容先拼接起来缓存到this.mcpToolRawMapping中
      json.choices?.[0]?.delta.tool_calls?.forEach((tool) => {
        if (tool.id) {
          this.currentToolId = tool.id
        }
        if (!this.mcpToolRawMapping[this.currentToolId]) {
          this.mcpToolRawMapping[this.currentToolId] = { name: '', arguments: '' }
        }

        if (tool.function.name) {
          this.mcpToolRawMapping[this.currentToolId].name += tool.function.name
        }

        if (tool.function.arguments) {
          this.mcpToolRawMapping[this.currentToolId].arguments += tool.function.arguments
        }
      })
    }
    catch (e) {
      if (!output.data.includes('[DONE]')) {
        console.log('extractContent error => ', e, output.data)
      }
    }

    return { message, reasoningContent, functioncalls: functioncalls.length > 0 ? functioncalls : undefined }
  }

  async transformRequestBody(_messages: IMessage[]): Promise<OpenAIRequestBody> {
    const requestBody: OpenAIRequestBody = {
      model: this.model,
      messages: this.transformMessages(_messages),
      stream: true,
      temperature: this.temperature,
    }

    if (this.enableMCP) {
      requestBody.tools = (await this.getAvailableToolsList()).map(tool => ({
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description || '',
          parameters: tool.inputSchema,
        },
      }))
      requestBody.tool_choice = 'auto'
    }

    return requestBody
  }

  async sendChatCompletions(_messages: IMessage[], options?: SendChatCompletionsOptions): Promise<XReadableStream> {
    this.validator()

    const { abortController } = options || {}
    const response = await request(`${this.apiHost}/chat/completions`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      signal: abortController?.signal,
      body: JSON.stringify(await this.transformRequestBody(_messages)),
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

  /**
   * 在父类的方法基础上在`onSuccess`增加对`this.mcpToolRawMapping`的解析
   * @param reader
   * @param callbacks
   */
  async parseSse(reader: ReadableStreamDefaultReader<SSEOutput>, callbacks?: ChatCompletionsCallbacks): Promise<void> {
    await super.parseSse(reader, {
      onUpdate: callbacks?.onUpdate,
      onSuccess: (data) => {
        if (this.enableMCP && Object.keys(this.mcpToolRawMapping).length) {
          const functionCalls = Object.entries(this.mcpToolRawMapping).map((temp) => {
            const [id, funcObj] = temp
            const [serverName, toolName] = funcObj.name.split(this.DEFAULT_MCP_TOOL_NAME_SEPARATOR)

            return createMcpToolCall({ id, serverName, toolName, args: safeParseJson(funcObj.arguments) })
          })
          callbacks?.onSuccess?.({
            ...data,
            functioncalls: functionCalls.length > 0 ? functionCalls : undefined,
          })
        }
        else {
          callbacks?.onSuccess?.(data)
        }
      },
    })

    this.mcpToolRawMapping = {}
    this.currentToolId = ''
  }
}

function safeParseJson(str: string) {
  try {
    return JSON.parse(str) as Record<string, unknown>
  }
  catch {
    return str
  }
}

function transformMessageItem(message: IMessage, hasMedia: boolean): MessageItem[] {
  if (message.role === Role.SYSTEM) {
    return [{ role: Role.SYSTEM, content: message.content }]
  }

  else if (message.role === Role.USER) {
    if (!hasMedia) {
      return [{ role: message.role, content: message.content }]
    }

    const content: (TextContent | ImageContent)[] = [
      { type: 'text', text: message.content },
    ]

    const imageMessages: ImageContent[] = message.images.map((item) => {
      return { type: 'image_url', image_url: { url: item.data } }
    })

    content.push(...imageMessages)

    return [{ role: message.role, content }]
  }
  else {
    const messages: MessageItem[] = []
    if (typeof message.content === 'string') {
      return [{ role: message.role, content: message.content }]
    }

    messages.push({
      role: Role.AI,
      content: message.content.map((item) => {
        if (item.type === 'image') {
          return { type: 'image_url', image_url: { url: `data:${item.mimeType};base64,${item.data}` } }
        }
        else {
          return { type: 'text', text: item.text }
        }
      }),
    })

    if (message.mcpTool) {
      messages.push({
        role: Role.AI,
        tool_calls: message.mcpTool.map(tool => ({
          function: {
            name: tool.serverName + tool.toolName,
            arguments: typeof tool.args === 'object' ? JSON.stringify(tool.args) : tool.args,
          },
          id: tool.id,
          type: 'function',
        })),
      } as ToolCallMessage)
      message.mcpTool.filter(s => s.result).forEach((tool) => {
        messages.push({
          role: 'tool',
          tool_call_id: tool.id,
          content: tool.result?.data || '',
        } as ToolResultMessage)
      })
    }

    return messages
  }
}
