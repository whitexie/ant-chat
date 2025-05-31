import type { ChatFeatures, IAttachment, ImageContent, IMcpToolCall, IMessage, IMessageContent, McpTool, TextContent } from '@ant-chat/shared'
import type {
  SendChatCompletionsOptions,
  ServiceConstructorOptions,
} from '../interface'
import type {
  FunctionDeclaration,
  GeminiFunctionCall,
  GeminiRequestBody,
  GeminiResponse,
  ModelContent,
  UserContent,
} from './interface'
import type { SSEOutput, XReadableStream } from '@/utils/stream'
import { createMcpToolCall } from '@/api/mcpApi'
import { request } from '@/utils'
import Stream from '@/utils/stream'
import BaseService from '../base'

const DEFAULT_STREAM_SEPARATOR = '\r\n\r\n'
const DEFAULT_PART_SEPARATOR = '\r\n'

const DEFAULT_OPTIONS = {
  apiHost: 'https://generativelanguage.googleapis.com/v1beta',
  apiKey: '',
  model: 'gemini-1.5-flash-latest',
  temperature: 0.7,
  maxTokens: 4096,
}

class GeminiService extends BaseService {
  private generativeImageModels: string[] = ['gemini-2.0-flash-exp-image-generation']

  constructor(options?: Partial<ServiceConstructorOptions>) {
    const _options = Object.assign({ ...DEFAULT_OPTIONS }, options)
    super(_options)
  }

  private transformFilePart(attachments: IAttachment[]) {
    return attachments.map((item) => {
      const { type: mimeType, data } = item
      const _data = data.replace(`data:${mimeType};base64,`, '')
      return { inline_data: { mimeType, data: _data } }
    })
  }

  transformMcpToolToMessage(tools: IMcpToolCall[]): GeminiRequestBody['contents'] {
    const result: GeminiRequestBody['contents'] = []
    for (const tool of tools) {
      const { serverName, toolName, args } = tool
      const name = serverName + this.mcpToolNameSeparator + toolName
      result.push({
        role: 'model',
        parts: [
          {
            functionCall: {
              name,
              args,
            },
          },
        ],
      })

      if (tool.result) {
        result.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name,
                response: {
                  result: (tool.result.success ? tool.result.data : tool.result.error),
                },
              },
            },
          ],
        })
      }
    }
    return result
  }

  transformMessages(messages: IMessage[]) {
    const result: GeminiRequestBody = {
      contents: [],
    }

    messages.forEach((msg) => {
      if (msg.role === 'user') {
        const content: UserContent = {
          role: 'user',
          parts: [],
        }

        if (msg.content.length > 0) {
          msg.content.forEach((item) => {
            if (item.type === 'text') {
              content.parts.push({ text: item.text })
            }
            else if (item.type === 'image') {
              content.parts.push({
                inline_data: {
                  mimeType: item.mimeType,
                  data: item.data,
                },
              })
            }
          })
        }

        if (msg?.images?.length) {
          content.parts.push(...this.transformFilePart(msg.images))
        }

        if (msg.attachments?.length) {
          content.parts.push(...this.transformFilePart(msg.attachments))
        }

        result.contents.push(content)
      }

      else if (msg.role === 'assistant') {
        if (typeof msg.content === 'string') {
          const content: ModelContent = {
            role: 'model',
            parts: [{ text: msg.content }],
          }
          result.contents.push(content)
        }
        else if (msg.content.length > 0) {
          result.contents.push({
            role: 'model',
            parts: (msg.content.filter(item => item.type !== 'error') as (TextContent | ImageContent)[]).map((item) => {
              if (item.type === 'text') {
                return { text: item.text }
              }

              return {
                inlineData: {
                  mimeType: item.mimeType,
                  data: item.data,
                },
              }
            }),
          })
        }

        // 处理mcpTool的消息转换
        if (msg.mcpTool) {
          const mcpMessages = this.transformMcpToolToMessage(msg.mcpTool)

          result.contents.push(...mcpMessages)
        }
      }
      else if (msg.role === 'system') {
        if (!result.system_instruction) {
          result.system_instruction = {
            parts: [],
          }
        }
        result.system_instruction.parts.push({ text: (msg.content[0] as TextContent).text })
      }
    })
    return result
  }

  async sendChatCompletions(messages: IMessage[], options?: SendChatCompletionsOptions): Promise<XReadableStream> {
    const { features, abortController } = options || {}
    this.validator()

    const url = `${this.apiHost}/models/${this.model}:streamGenerateContent?alt=sse&key=${this.apiKey}`
    const response = await request(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      signal: abortController?.signal,
      body: JSON.stringify(await this.transformRequestBody(messages, features)),
    })

    if (!response.ok) {
      const statusText = `${response.status}`
      if (statusText.startsWith('4') || statusText.startsWith('5')) {
        const json = await response.json()

        throw new Error(`请求失败. ${json.error.message}`)
      }
      else {
        throw new Error(`请求失败： ${response.statusText}`)
      }
    }

    return Stream({ readableStream: response.body!, DEFAULT_STREAM_SEPARATOR, DEFAULT_PART_SEPARATOR })
  }

  async transformRequestBody(_messages: IMessage[], features?: Partial<ChatFeatures>): Promise<GeminiRequestBody> {
    const body = this.transformMessages(_messages)
    body.generationConfig = {
      temperature: this.temperature,
      maxOutputTokens: this.maxTokens,
    }

    if (features?.onlineSearch) {
      body.tools = [
        { googleSearch: {} },
      ]
    }

    if (this.enableMCP) {
      const functionDeclarations: FunctionDeclaration = {
        functionDeclarations: [],
      }

      // 转换可用的MCP工具
      functionDeclarations.functionDeclarations = mcpToolsToGeminiTools(await this.getAvailableToolsList())

      if (!body.tools) {
        body.tools = []
      }

      body.toolConfig = {
        functionCallingConfig: {
          mode: 'auto',
        },
      }

      body.tools.push(functionDeclarations)
    }

    if (this.generativeImageModels.includes(this.model)) {
      body.generationConfig.responseModalities = ['TEXT', 'IMAGE']

      // 图像生成模型不支持`system_instruction`参数
      delete body.system_instruction
    }

    return body
  }

  extractContent(output: SSEOutput) {
    let json: null | GeminiResponse = null
    try {
      json = JSON.parse(output.data) as GeminiResponse
    }
    catch {
      console.warn('JSON 解析失败：', output.data)
    }

    const message: IMessageContent = [
    ]
    const functioncalls: IMcpToolCall[] = []

    const items = json?.candidates[0].content.parts || []

    items.forEach((part, index) => {
      if ('text' in part) {
        if (!message[index]) {
          message[index] = { type: 'text', text: '' }
        }
        (message[index] as TextContent).text += part.text
      }
      else if ('functionCall' in part) {
        const { name, args } = part.functionCall
        const [serverName, toolName] = name.split(this.mcpToolNameSeparator)

        functioncalls.push(
          createMcpToolCall({
            serverName,
            toolName,
            args: typeof args === 'string' ? JSON.parse(args) : args,
          }),
        )
      }
      else if ('inlineData' in part) {
        const { mimeType, data } = part.inlineData
        message.push({ type: 'image', mimeType, data })
      }
    })

    return {
      message,
      reasoningContent: '',
      functioncalls: functioncalls.length > 0 ? functioncalls : undefined,
    }
  }
}

/**
 * 将MCP工具定义转换为Gemini工具格式
 * @param mcpTools MCP工具定义数组
 * @returns Gemini工具格式的工具定义
 * @fork https://github.com/ThinkInAIXYZ/deepchat/blob/dev/src/main/presenter/mcpPresenter/index.ts#L515
 */
export function mcpToolsToGeminiTools(mcpTools: McpTool[]): GeminiFunctionCall[] {
  if (!mcpTools || mcpTools.length === 0) {
    return []
  }

  // 递归清理Schema对象，确保符合Gemini API要求
  const cleanSchema = (schema: Record<string, unknown>): Record<string, unknown> => {
    const allowedTopLevelFields = ['type', 'description', 'enum', 'properties', 'items', 'nullable', 'anyOf']

    // 创建新对象，只保留允许的字段
    const cleanedSchema: Record<string, unknown> = {}

    // 处理允许的顶级字段
    for (const field of allowedTopLevelFields) {
      if (field in schema) {
        if (field === 'properties' && typeof schema.properties === 'object') {
          // 递归处理properties中的每个属性
          const properties = schema.properties as Record<string, unknown>
          const cleanedProperties: Record<string, unknown> = {}

          for (const [propName, propValue] of Object.entries(properties)) {
            if (typeof propValue === 'object' && propValue !== null) {
              cleanedProperties[propName] = cleanSchema(propValue as Record<string, unknown>)
            }
            else {
              cleanedProperties[propName] = propValue
            }
          }

          cleanedSchema.properties = cleanedProperties
        }
        else if (field === 'items' && typeof schema.items === 'object') {
          // 递归处理items对象
          cleanedSchema.items = cleanSchema(schema.items as Record<string, unknown>)
        }
        else if (field === 'anyOf' && Array.isArray(schema.anyOf)) {
          // 递归处理anyOf数组中的每个选项
          cleanedSchema.anyOf = (schema.anyOf as Array<Record<string, unknown>>).map(cleanSchema)
        }
        else {
          // 其他字段直接复制
          cleanedSchema[field] = schema[field]
        }
      }
    }

    return cleanedSchema
  }

  // 处理每个工具定义，构建符合Gemini API的函数声明
  const functionDeclarations = mcpTools.map((toolDef) => {
    // 转换为内部工具表示
    const tool = toolDef

    // 获取参数属性
    const properties = tool.inputSchema.properties
    const processedProperties: Record<string, Record<string, unknown>> = {}

    // 处理每个属性，应用清理函数
    for (const [propName, propValue] of Object.entries(properties)) {
      if (typeof propValue === 'object' && propValue !== null) {
        processedProperties[propName] = cleanSchema(propValue as Record<string, unknown>)
      }
    }

    // 准备函数声明结构
    const functionDeclaration = {
      name: tool.name,
      description: tool.description,
    } as GeminiFunctionCall

    if (Object.keys(processedProperties).length > 0) {
      functionDeclaration.parameters = {
        type: 'object',
        properties: processedProperties,
        required: tool.inputSchema.required || [],
      }
    }

    // 记录没有参数的函数
    if (Object.keys(processedProperties).length === 0) {
      console.log(`[MCP] 函数 ${tool.name} 没有参数，提供了最小化的参数结构`)
    }

    return functionDeclaration
  })

  return functionDeclarations
}

export default GeminiService
