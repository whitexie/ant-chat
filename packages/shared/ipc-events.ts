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
