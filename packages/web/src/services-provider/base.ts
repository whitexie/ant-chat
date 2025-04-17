import type { IMcpToolCall, IMessage } from '@/db/interface'
import type { SSEOutput, XReadableStream } from '@/utils/stream'
import type { McpTool } from '@ant-chat/shared'
import type {
  ChatCompletionsCallbacks,
  SendChatCompletionsOptions,
  ServiceConstructorOptions,
} from './interface'
import { getAllAvailableToolsList } from '@/mcp/api'
import { DEFAULT_MCP_TOOL_NAME_SEPARATOR } from '@ant-chat/shared'

export default abstract class BaseService {
  protected apiHost: string
  protected apiKey: string
  protected model: string
  protected temperature: number = 0.7
  protected enableMCP = false

  protected DEFAULT_MCP_TOOL_NAME_SEPARATOR = DEFAULT_MCP_TOOL_NAME_SEPARATOR

  constructor(options: ServiceConstructorOptions) {
    this.apiHost = options.apiHost
    this.apiKey = options.apiKey
    this.model = options.model
    this.temperature = options.temperature
    this.enableMCP = !!options.enableMCP

    if (this.enableMCP) {
      this.initializeMCPParser()
    }
  }

  initializeMCPParser() {

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
    const functioncalls: IMcpToolCall[] = []

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
          if (result.functioncalls) {
            functioncalls.push(...result.functioncalls)
          }
          callbacks?.onUpdate?.({ message, reasoningContent, functioncalls: functioncalls.length > 0 ? functioncalls : undefined })
        }
      }
    }
    catch (e) {
      const error = e as Error
      callbacks?.onError?.(error)
    }
  }

  async getAvailableToolsList(): Promise<McpTool[]> {
    return await getAllAvailableToolsList()
  }

  abstract extractContent(output: unknown): { message: string, reasoningContent: string, functioncalls?: IMcpToolCall[] }

  abstract transformRequestBody(messages: IMessage[]): unknown | Promise<unknown>

  abstract sendChatCompletions(messages: IMessage[], options?: SendChatCompletionsOptions): Promise<XReadableStream>
}
