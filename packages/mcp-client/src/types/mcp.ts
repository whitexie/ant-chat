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
  inputSchema?: object
  // autoApprove?: boolean
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
