import type { McpServerConfig, McpSettings } from '@ant-chat/mcp-client-hub'
import type { IConversations, IMessage, McpConfig, McpServer, McpTool } from '@ant-chat/shared'
import type { ConversationsUpdateSchema, McpConfigsInsertSchema, McpConfigsUpdateSchema, MessageUpdateSchema } from 'src/main/db/schema'
import type { IpcPaginatedResponse, IpcResponse } from 'src/main/utils/ipc-events-bus'
// Main process ipc events
export type IpcEvents =
  | {
    ping: [string] // listener event map
  }
  | {
    // ============================ Conversaations 相关 ============================
    'db:get-conversations': (pageIndex: number, pageSize: number) => Promise<IpcPaginatedResponse<IConversations[] | null>>
    'db:get-conversation-by-id': (id: string) => Promise<IpcResponse<IConversations | null>>
    'db:add-conversation': (conversations: Partial<IConversations>) => Promise<IpcResponse<IConversations | null>>
    'db:update-conversation': (conversations: ConversationsUpdateSchema) => Promise<IpcResponse<IConversations | null>>
    'db:delete-conversation': (id: string) => Promise<IpcResponse<null>>

    // ============================ Message 相关 ============================
    'db:get-message-by-id': (id: string) => Promise<IpcResponse<IMessage | null>>
    'db:get-message-by-convid': (id: string) => Promise<IpcResponse<IMessage[] | null>>
    'db:delete-message': (id: string) => Promise<IpcResponse<null>>
    'db:add-message': (conversations: Omit<Partial<IMessage>, 'id'>) => Promise<IpcResponse<IMessage | null>>
    'db:update-message': (conversations: MessageUpdateSchema) => Promise<IpcResponse<IMessage | null>>
    'db:get-messages-by-conv-id-with-pagination': (id: string, pageIndex: number, pageSize: number) => Promise<IpcPaginatedResponse<IMessage[] | null>>
    'db:batch-delete-messages': (ids: string[]) => Promise<IpcResponse<null>>

    // ============================ MCP Server 相关 ============================
    'db:get-mcp-configs': () => Promise<IpcResponse<McpConfig[] | null>>
    'db:add-mcp-config': (config: McpConfigsInsertSchema) => Promise<IpcResponse<McpConfig | null>>
    'db:update-mcp-config': (config: McpConfigsUpdateSchema) => Promise<IpcResponse<McpConfig | null>>
    'db:delete-mcp-config': (name: string) => Promise<IpcResponse<null>>
    'db:get-mcp-config-by-server-name': (name: string) => Promise<IpcResponse<McpConfig | null>>
    'mcp:getConnections': () => Promise<IpcResponse<Pick<McpServer, 'name' | 'config' | 'tools' | 'status'>[]>>
    'mcp:getAllAvailableToolsList': () => Promise<IpcResponse<McpTool[]>>
    'mcp:callTool': (serverName: string, toolName: string, toolArguments?: Record<string, unknown>) => Promise<IpcResponse<unknown>>
    'mcp:connectMcpServer': (name: string, mcpConfig: McpServerConfig) => Promise<IpcResponse<null>>
    'mcp:disconnectMcpServer': (name: string) => Promise<IpcResponse<null>>
    'mcp:reconnectMcpServer': (name: string, mcpConfig: McpServerConfig) => Promise<IpcResponse<null>>
    'mcp:fetchMcpServerTools': (name: string) => Promise<IpcResponse<McpTool[]>>
    'mcp:mcpToggle': (isEnable: boolean, mcpConfig?: McpSettings) => Promise<IpcResponse<null>>
  }

// Renderer ipc events
export interface IpcRendererEvent {
  ready: [boolean]
}
