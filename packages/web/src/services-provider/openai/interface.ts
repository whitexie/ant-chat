import type { Role } from '@/constants'
import type { McpTool } from '@ant-chat/shared'

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image_url'
  image_url: {
    url: string
  }
}

export type MessageContent = string | (TextContent | ImageContent)[]

export type MessageItem = {
  role: Role
  content: MessageContent
} | ToolResultMessage | ToolCallMessage

export interface ToolCallMessage {
  role: 'assistant'
  tool_calls: {
    id: string
    type: 'function'
    function: OpenAIFunction
  }[]
}

export interface OpenAIFunction {
  name: string
  arguments: string
}

export interface ToolCall {
  index: number
  id: string
  function: Partial<OpenAIFunction>
}

export interface ToolResultMessage {
  role: 'tool'
  tool_call_id: string
  content: string
}

export interface OpenAITool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: McpTool['inputSchema']
  }
}

export type McpToolRawMapping = Record<string, { name: string, arguments: string }>

export interface OpenAIRequestBody {
  model: string
  messages: MessageItem[]
  stream: boolean
  temperature?: number
  tools?: OpenAITool[]
}

export interface OpenAIResponseChoice {
  index: number
  delta: {
    content?: string
    reasoning_content?: string
    tool_calls?: ToolCall[]
    finish_reason: 'stop' | 'length' | 'content_filter' | 'tool_calls' | 'insufficient_system_resource'
  }
}

export interface OpenAIResponse {
  id: string
  choices: OpenAIResponseChoice[]
  model: string
  created: number
  object: string
}
