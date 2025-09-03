import type { CreateConversationTitleOptions, IMessage, McpTool, MessageContent, SendChatCompletionsOptions } from '@ant-chat/shared'
import type { ChatCompletionAssistantMessageParam, ChatCompletionChunk, ChatCompletionTool, ChatCompletionToolChoiceOption, ChatCompletionUserMessageParam } from 'openai/resources/index'
import type { AIProvider, ProviderOptions, StreamChunk } from '../interface'
import { DEFAULT_MCP_TOOL_NAME_SEPARATOR } from '@ant-chat/shared'
import { clientHub } from '@main/mcpClientHub'
import { logger } from '@main/utils/logger'
import OpenAI from 'openai'
import { createMcpToolCall } from '../util'

export type McpToolRawMapping = Record<string, { name: string, arguments: string }>

class OpenAIService implements AIProvider {
  private client: OpenAI
  /**
   * call_tools的不是一次性全都返回的，需要缓存拼接，等待全部传输完后再进行解析
   */
  private mcpToolRawMapping: McpToolRawMapping = {}
  private currentToolId: string = ''

  constructor(options: ProviderOptions) {
    const { baseUrl: baseURL, apiKey } = options

    // OpenAI会自动使用环境变量中的代理设置 (HTTP_PROXY, HTTPS_PROXY)
    // 无需手动配置代理
    this.client = new OpenAI({ baseURL, apiKey })

    logger.info(`OpenAI client initialized for ${baseURL}`)
    logger.info(`Using proxy: ${process.env.HTTP_PROXY || 'none'}`)
  }

  private transformUserMessageContent(contents: MessageContent): ChatCompletionUserMessageParam['content'] {
    const result: ChatCompletionUserMessageParam['content'] = []

    contents.forEach((content) => {
      if (content.type === 'text') {
        result.push({ type: 'text', text: content.text })
      }
      else if (content.type === 'image') {
        result.push({ type: 'image_url', image_url: { url: content.data } })
      }
    })

    return result
  }

  private transformAssistantMessageContent(contents: MessageContent): ChatCompletionAssistantMessageParam['content'] {
    const result: ChatCompletionAssistantMessageParam['content'] = []

    contents.forEach((content) => {
      if (content.type === 'text') {
        result.push({ type: 'text', text: content.text })
      }
    })

    return result
  }

  private transformMessages(messages: IMessage[]): OpenAI.Chat.Completions.ChatCompletionMessageParam[] {
    const result: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = []

    messages.forEach((msg) => {
      if (msg.role === 'user') {
        result.push({ role: 'user', content: this.transformUserMessageContent(msg.content) })
      }
      else {
        result.push({ role: 'assistant', content: this.transformAssistantMessageContent(msg.content) })
      }
    })

    return result
  }

  private transformMcpTools(tools: McpTool[]): ChatCompletionTool[] {
    return tools.map(tool => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description || '',
        parameters: tool.inputSchema,
      },
    }))
  }

  async* sendChatCompletions(options: SendChatCompletionsOptions): AsyncIterable<StreamChunk> {
    const { messages, chatSettings } = options
    const { systemPrompt, temperature, maxTokens: max_completion_tokens, model, features } = chatSettings
    let toolsConfig: object | { tools: ChatCompletionTool[], tool_choice: ChatCompletionToolChoiceOption } = {}
    let tools: ChatCompletionTool[] | undefined

    if (features.enableMCP) {
      const mcpTools = clientHub.getAllAvailableToolsList()
      tools = this.transformMcpTools(mcpTools)

      toolsConfig = { tools, tool_choice: 'auto' }
    }

    const stream = await this.client.chat.completions.create(
      {
        ...toolsConfig,
        model,
        temperature,
        max_completion_tokens,
        messages: [
          { role: 'system', content: systemPrompt },
          ...this.transformMessages(messages),
        ],
        stream: true,
      },
      { signal: options.abortSignal },
    )

    for await (const chunk of stream) {
      const { finish_reason } = chunk.choices[0]

      if (finish_reason) {
        if (Object.keys(this.mcpToolRawMapping).length) {
          yield {
            content: [],
            reasoningContent: '',
            functionCalls: Object.entries(this.mcpToolRawMapping).map((temp) => {
              const [id, funcObj] = temp
              const [serverName, toolName] = funcObj.name.split(DEFAULT_MCP_TOOL_NAME_SEPARATOR)

              return createMcpToolCall({ id, serverName, toolName, args: safeParseJson(funcObj.arguments) })
            }),
          }
        }
        break
      }

      const { content, reasoning_content, tool_calls } = chunk.choices[0].delta as ChatCompletionChunk.Choice.Delta & { reasoning_content?: string }

      tool_calls?.forEach((tool) => {
        if (tool.id) {
          this.currentToolId = tool.id
        }
        if (!this.mcpToolRawMapping[this.currentToolId]) {
          this.mcpToolRawMapping[this.currentToolId] = { name: '', arguments: '' }
        }

        if (tool.function?.name) {
          this.mcpToolRawMapping[this.currentToolId].name += tool.function.name
        }

        if (tool.function?.arguments) {
          this.mcpToolRawMapping[this.currentToolId].arguments += tool.function.arguments
        }
      })

      yield {
        content: [{ type: 'text', text: content ?? '' }],
        reasoningContent: reasoning_content ?? '',
      }
    }
  }

  async createConversationTitle(options: CreateConversationTitleOptions) {
    const { context, model } = options

    const resp = await this.client.chat.completions.create({
      messages: [{ role: 'user', content: context }],
      model,
      stream: false,
    })

    return resp.choices[0].message.content ?? ''
  }
}

function safeParseJson(str: string) {
  try {
    return JSON.parse(str) as Record<string, unknown>
  }
  catch {
    return {}
  }
}

export default OpenAIService
