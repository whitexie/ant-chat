import type { IMcpToolCall, McpConfig } from '@/db/interface'
import type { McpConnection, McpToolCallResponse } from '@ant-chat/shared'
import { uuid } from '@/utils'
import { ipcEvents } from '@ant-chat/shared'

export async function getMcpServers(): Promise<McpConnection[]> {
  try {
    return await window.electronAPI.ipcRenderer.invoke('mcp:getConnections')
  }
  catch (e) {
    const error = e as Error
    console.warn('getMcpServers fail: ', error.message)
    return []
  }
}

export async function getConnectedMcpServers(): Promise<McpConnection[]> {
  const servers = await getMcpServers()
  return servers.filter(server => server.status === 'connected' && !server.disabled)
}

// 获取App操作系统
export async function getAppOS() {
  return await window.electronAPI.ipcRenderer.invoke('app-os')
}

export async function getAllAvailableToolsList() {
  return await window.electronAPI.ipcRenderer.invoke('mcp:getAllAvailableToolsList')
}

type CreateMcpToolCallOptions = Partial<Omit<IMcpToolCall, 'serverName' | 'toolName' | 'args'>> & Pick<IMcpToolCall, 'serverName' | 'toolName' | 'args'>

export function createMcpToolCall(options: CreateMcpToolCallOptions): IMcpToolCall {
  if (!options.serverName || !options.toolName || !options.args) {
    throw new Error('serverName, toolName and arguments are required')
  }

  return {
    id: uuid('functioncall-'),
    ...options,
    executeState: 'await',
  }
}

export async function executeMcpToolCall(toolCall: IMcpToolCall): Promise<McpToolCallResponse> {
  const { serverName, toolName, args } = toolCall
  return await window.electronAPI.ipcRenderer.invoke('mcp:callTool', serverName, toolName, args)
}

export async function connectMcpServer(config: McpConfig) {
  const { serverName } = config

  return await window.electronAPI.ipcRenderer.invoke(ipcEvents.CONNECT_MCP_SERVER, serverName, config)
}

export async function fetchMcpServerTools(name: string) {
  return await window.electronAPI.ipcRenderer.invoke(ipcEvents.FETCH_MCP_SERVER_TOOLS, name)
}
