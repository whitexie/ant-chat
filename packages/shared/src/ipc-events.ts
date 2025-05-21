import type { IConversations, IMessage, McpServer, McpTool, McpToolCallResponse, NotificationOption } from './interfaces'
import type { AddMcpConfigSchema, AddProviderServiceSchema, AllAvailableModelsSchema, McpConfigSchema, ProviderServiceModelsSchema, ProviderServiceSchema, UpdateConversationsSchema, UpdateMcpConfigSchema, UpdateProviderServiceSchema } from './schemas'

export function createIpcResponse<T>(success: boolean, data: T, msg?: string): IpcResponse<T> | ErrorIpcResponse {
  if (success) {
    return { success, data }
  }

  return {
    success,
    msg: msg ?? '',
  }
}

export function createIpcPaginatedResponse<T>(success: boolean, data: T, msg?: string, total?: number): IpcPaginatedResponse<T> {
  if (success) {
    return { success, data, total: total ?? 0 }
  }

  return {
    success,
    msg: msg ?? '',
  }
}

export function createErrorIpcResponse(errMsg: string | Error): ErrorIpcResponse {
  return { success: false, msg: typeof errMsg === 'string' ? errMsg : errMsg.message }
}

interface IpcResponseSuccess<T> {
  success: true
  data: T
}

interface IpcPaginatedResponseSuccess<T> extends IpcResponseSuccess<T> {
  total: number
}

export interface ErrorIpcResponse {
  success: false
  msg: string
}

export type IpcResponse<T> = IpcResponseSuccess<T> | ErrorIpcResponse

export type IpcPaginatedResponse<T> = IpcPaginatedResponseSuccess<T> | ErrorIpcResponse

// Main process ipc events
export type IpcEvents =
  | {
    /**
     *  这里是定义的是在渲染进程使用
     * @example
     * const emitter = new IpcEmitter<IpcEvents>()
     * emitter.send('ping', 'pong')
     */
    ping: [string] // listener event map
  }
  | {
    // ============================ 全局 相关 ============================
    'common:clipboard-write': (data: Electron.Data, type?: 'selection' | 'clipboard') => Promise<boolean>

    // ============================ Conversaations 相关 ============================
    'db:get-conversations': (pageIndex: number, pageSize: number) => Promise<IpcPaginatedResponse<IConversations[]>>
    'db:conversations-is-exists': (id: string) => Promise<IpcResponse<null>>
    'db:get-conversation-by-id': (id: string) => Promise<IpcResponse<IConversations>>
    'db:add-conversation': (conversations: Partial<IConversations>) => Promise<IpcResponse<IConversations>>
    'db:update-conversation': (conversations: UpdateConversationsSchema) => Promise<IpcResponse<IConversations>>
    'db:delete-conversation': (id: string) => Promise<IpcResponse<null>>

    // ============================ Message 相关 ============================
    'db:get-message-by-id': (id: string) => Promise<IpcResponse<IMessage>>
    'db:get-message-by-convid': (id: string) => Promise<IpcResponse<IMessage[]>>
    'db:delete-message': (id: string) => Promise<IpcResponse<null>>
    'db:add-message': (conversations: Omit<Partial<IMessage>, 'id'>) => Promise<IpcResponse<IMessage>>
    'db:update-message': (conversations: UpdateConversationsSchema) => Promise<IpcResponse<IMessage>>
    'db:get-messages-by-conv-id-with-pagination': (id: string, pageIndex: number, pageSize: number) => Promise<IpcPaginatedResponse<IMessage[]>>
    'db:batch-delete-messages': (ids: string[]) => Promise<IpcResponse<null>>

    // ============================ MCP Server 相关 ============================
    'db:get-mcp-configs': () => Promise<IpcResponse<McpConfigSchema[]>>
    'db:add-mcp-config': (config: AddMcpConfigSchema) => Promise<IpcResponse<McpConfigSchema>>
    'db:update-mcp-config': (config: UpdateMcpConfigSchema) => Promise<IpcResponse<McpConfigSchema>>
    'db:delete-mcp-config': (name: string) => Promise<IpcResponse<null>>
    'db:get-mcp-config-by-server-name': (name: string) => Promise<IpcResponse<McpConfigSchema>>
    'mcp:get-connections': () => Promise<IpcResponse<Pick<McpServer, 'name' | 'config' | 'tools' | 'status'>[]>>
    'mcp:get-all-available-tools-list': () => Promise<IpcResponse<McpTool[]>>
    'mcp:call-tool': (serverName: string, toolName: string, toolArguments?: Record<string, unknown>) => Promise<IpcResponse<McpToolCallResponse>>
    'mcp:connect-mcp-server': (name: string, mcpConfig: McpConfigSchema) => Promise<IpcResponse<null>>
    'mcp:disconnect-mcp-server': (name: string) => Promise<IpcResponse<null>>
    'mcp:reconnect-mcp-server': (name: string, mcpConfig: McpConfigSchema) => Promise<IpcResponse<null>>
    'mcp:fetch-mcp-server-tools': (name: string) => Promise<IpcResponse<McpTool[]>>
    'mcp:mcpToggle': (isEnable: boolean, mcpConfig?: McpConfigSchema[]) => Promise<IpcResponse<null>>

    // ============================ AI服务商相关 ============================
    'db:get-all-provider-services': () => Promise<IpcResponse<ProviderServiceSchema[]>>
    'db:update-provider-services': (data: UpdateProviderServiceSchema) => Promise<IpcResponse<ProviderServiceSchema>>
    'db:add-provider-services': (data: AddProviderServiceSchema) => Promise<IpcResponse<ProviderServiceSchema>>
    'db:delete-provider-services': (id: string) => Promise<IpcResponse<null>>
    'db:get-provider-services-by-id': (id: string) => Promise<IpcResponse<ProviderServiceSchema>>

    // ============================ 模型相关 ============================
    'db:get-all-abvailable-models': () => Promise<IpcResponse<AllAvailableModelsSchema[]>>
    'db:get-models-by-provider-service-id': (id: string) => Promise<IpcResponse<ProviderServiceModelsSchema[]>>
    'db:set-model-enabled-status': (id: string, status: boolean) => Promise<IpcResponse<ProviderServiceModelsSchema>>

    'db:get-custom-models': (provider: string) => Promise<IpcResponse<any>>
    'db:delete-model': (id: string) => Promise<IpcResponse<null>>
    'db:add-model': (model: any) => Promise<IpcResponse<null>>
  }

// Renderer ipc events
export interface IpcRendererEvent {
  'mcp:McpServerStatusChanged': [string, 'disconnected' | 'connected']
  'common:Notification': [NotificationOption]

  [key: string]: unknown[]
}
