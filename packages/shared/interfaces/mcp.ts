export interface McpServer {
  name: string
  config: string
  status: 'connected' | 'connecting' | 'disconnected'
  error?: string
  tools?: McpTool[]
  resources?: McpResource[]
  resourceTemplates?: McpResourceTemplate[]
  disabled?: boolean
  timeout?: number
}

export interface McpTool {
  name: string
  description?: string
  inputSchema: {
    type: 'object'
    properties: Record<string, Record<string, unknown>>
    required: string[]
  }
}

export interface McpResource {
  uri: string
  name: string
  mimeType?: string
  description?: string
}

export interface McpResourceTemplate {
  uriTemplate: string
  name: string
  description?: string
  mimeType?: string
}

export type McpConnection = Pick<McpServer, 'name' | 'config' | 'status' | 'tools' | 'disabled'>

/**
 * Mcp Tool 调用的响应结果
 */
export interface McpToolCallResponse {
  content: { type: 'text', text: string }[]
  isError?: boolean
}
