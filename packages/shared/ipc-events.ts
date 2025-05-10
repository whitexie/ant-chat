/**
 * 获取MCP初始化状态
 */
export const GET_MCP_INITIALIZE_STATE = 'mcp:getInitializeState'

/**
 * 获取当前已连接的服务
 */
export const GET_CONNECTED_SERVERS = 'mcp:getConnections'

/**
 * 获取当前可用的tools
 */
export const GET_ALL_ABAILABLE_TOOLS = 'mcp:getAllAvailableToolsList'

/**
 * 调用Tool
 */
export const CALL_TOOL = 'mcp:callTool'

export const MCP_SERVER_STATUS_CHANGED = 'mcp:McpServerStatusChanged'
export const CONNECT_MCP_SERVER = 'mcp:connectMcpServer'
export const DISCONNECT_MCP_SERVER = 'mcp:disconnectMcpServer'
export const RECONNECT_MCP_SERVER = 'mcp:reconnectMcpServer'
export const FETCH_MCP_SERVER_TOOLS = 'mcp:fetchMcpServerTools'
export const MCP_TOGGLE = 'mcp:mcpToggle'
export const NOTIFICATION = 'global:Notification'

// 数据库操作 IPC 事件名
export const dbIpcEvents = {
  // 数据迁移
  MIGRATE_FROM_INDEXEDDB: 'db:migrate-from-indexeddb',

  // 会话操作
  GET_CONVERSATIONS: 'db:get-conversations',
  GET_CONVERSATION_BY_ID: 'db:get-conversation-by-id',
  ADD_CONVERSATION: 'db:add-conversation',
  UPDATE_CONVERSATION: 'db:update-conversation',
  DELETE_CONVERSATION: 'db:delete-conversation',

  // 消息操作
  GET_MESSAGE_BY_ID: 'db:get-message-by-id',
  ADD_MESSAGE: 'db:add-message',
  UPDATE_MESSAGE: 'db:update-message',
  DELETE_MESSAGE: 'db:delete-message',
  GET_MESSAGES_BY_CONV_ID: 'db:get-messages-by-conv-id',
  GET_MESSAGES_BY_CONV_ID_WITH_PAGINATION: 'db:get-messages-by-conv-id-with-pagination',
  BATCH_DELETE_MESSAGES: 'db:batch-delete-messages',

  // 自定义模型操作
  GET_CUSTOM_MODELS: 'db:get-custom-models',
  ADD_CUSTOM_MODEL: 'db:add-custom-model',
  DELETE_CUSTOM_MODEL: 'db:delete-custom-model',

  // MCP配置操作
  GET_MCP_CONFIGS: 'db:get-mcp-configs',
  GET_MCP_CONFIG_BY_SERVER_NAME: 'db:get-mcp-config-by-server-name',
  ADD_MCP_CONFIG: 'db:add-mcp-config',
  UPDATE_MCP_CONFIG: 'db:update-mcp-config',
  DELETE_MCP_CONFIG: 'db:delete-mcp-config',
}

// 导出 IPC 事件类型
export type DbIpcEventKeys = keyof typeof dbIpcEvents
export type DbIpcEventValues = typeof dbIpcEvents[DbIpcEventKeys]
