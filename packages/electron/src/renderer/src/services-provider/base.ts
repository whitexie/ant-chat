import type { IMcpToolCall, IMessage, IMessageContent, McpTool, TextContent } from '@ant-chat/shared'
import type {
  ChatCompletionsCallbacks,
  SendChatCompletionsOptions,
  ServiceConstructorOptions,
} from './interface'
import type { SSEOutput, XReadableStream } from '@/utils/stream'
import { DEFAULT_MCP_TOOL_NAME_SEPARATOR } from '@ant-chat/shared'
import { getAllAvailableToolsList } from '@/api/mcpApi'

// BaseService 是一个抽象类，提供了与服务交互的基础功能，例如验证、设置参数和解析 SSE 数据。
export default abstract class BaseService {
  // 服务的 API 主机地址
  protected apiHost: string
  // 服务的 API 密钥
  protected apiKey: string
  // 使用的模型名称
  protected model: string
  // 温度参数，用于控制生成内容的随机性
  protected temperature: number = 0.7

  // 最大令牌数
  protected maxTokens: number = 4096
  // 是否启用 MCP（多工具调用）功能
  protected enableMCP = false

  // MCP 工具名称分隔符的默认值
  protected mcpToolNameSeparator = DEFAULT_MCP_TOOL_NAME_SEPARATOR

  // 构造函数，用于初始化服务配置
  constructor(options: ServiceConstructorOptions) {
    this.apiHost = options.apiHost
    this.apiKey = options.apiKey
    this.model = options.model
    this.temperature = options.temperature
    this.maxTokens = options.maxTokens
    this.enableMCP = !!options.enableMCP

    if (this.enableMCP) {
      this.initializeMCPParser()
    }
  }

  // 初始化 MCP 解析器（具体实现由子类定义）
  initializeMCPParser() {

  }

  // 验证必要的配置是否已设置
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

  // 设置温度参数
  setTemperature(temperature: number) {
    this.temperature = temperature
  }

  // 设置 API 密钥
  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  // 设置 API 主机地址
  setApiHost(apiHost: string) {
    this.apiHost = apiHost
  }

  // 设置模型名称
  setModel(model: string) {
    this.model = model
  }

  // 获取 API 主机地址
  getApiHost(): string {
    return this.apiHost
  }

  // 解析 SSE（服务器发送事件）流数据
  async parseSse(reader: ReadableStreamDefaultReader<SSEOutput>, callbacks?: ChatCompletionsCallbacks) {
    // message 用于存储解析后的消息内容
    const message: IMessageContent = []
    // reasoningContent 用于存储推理内容
    let reasoningContent = ''
    // functioncalls 用于存储函数调用信息
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

          // 合并连续的文本消息
          result.message.forEach((item) => {
            if (item.type === 'text' && message.length > 0 && message[message.length - 1].type === 'text') {
              (message[message.length - 1] as TextContent).text += item.text
            }
            else {
              message.push(item)
            }
          })

          reasoningContent += result.reasoningContent
          if (result.functioncalls) {
            functioncalls.push(...result.functioncalls)
          }
          callbacks?.onUpdate?.({ message: [...message], reasoningContent, functioncalls: functioncalls.length > 0 ? functioncalls : undefined })
        }
      }
    }
    catch (e) {
      // 捕获并处理错误
      const error = e as Error
      console.error(e)
      callbacks?.onError?.(error)
    }
  }

  // 获取可用的工具列表
  async getAvailableToolsList(): Promise<McpTool[]> {
    const resp = await getAllAvailableToolsList()

    if (!resp.success) {
      throw new Error(resp.msg)
    }

    return resp.data || []
  }

  // 抽象方法：提取内容（由子类实现）
  abstract extractContent(output: unknown): { message: IMessageContent, reasoningContent: string, functioncalls?: IMcpToolCall[] }

  // 抽象方法：转换请求体（由子类实现）
  abstract transformRequestBody(messages: IMessage[]): unknown | Promise<unknown>

  // 抽象方法：发送聊天完成请求（由子类实现）
  abstract sendChatCompletions(messages: IMessage[], options?: SendChatCompletionsOptions): Promise<XReadableStream>
}
