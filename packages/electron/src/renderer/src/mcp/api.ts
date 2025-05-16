import type { McpConfigSchema, McpConnection, McpToolCall, McpToolCallResponse } from '@ant-chat/shared'
import { uuid } from '@/utils'
import { emitter } from '@/utils/ipc-bus'

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

// 获取App操作系统
export async function getAppOS() {
  return await window.electronAPI.ipcRenderer.invoke('app-os')
}

export async function getAllAvailableToolsList() {
  return await emitter.invoke('mcp:getAllAvailableToolsList')
}

type CreateMcpToolCallOptions = Partial<Omit<McpToolCall, 'serverName' | 'toolName' | 'args'>> & Pick<McpToolCall, 'serverName' | 'toolName' | 'args'>

export function createMcpToolCall(options: CreateMcpToolCallOptions): McpToolCall {
  if (!options.serverName || !options.toolName || !options.args) {
    throw new Error('serverName, toolName and arguments are required')
  }

  return {
    id: uuid('functioncall-'),
    ...options,
    executeState: 'await',
  }
}

export async function executeMcpToolCall(toolCall: McpToolCall): Promise<McpToolCallResponse> {
  const { serverName, toolName, args } = toolCall
  const resp = await emitter.invoke('mcp:callTool', serverName, toolName, args)
  if (resp.success) {
    return resp.data
  }
  throw new Error(resp.msg)
}

export async function connectMcpServer(config: McpConfigSchema): Promise<[boolean, string]> {
  const { serverName } = config

  const resp = await emitter.invoke('mcp:connectMcpServer', serverName, config)

  return [resp.success, resp.success ? '' : resp.msg]
}

export async function disconnectMcpServer(name: string): Promise<boolean> {
  return (await emitter.invoke('mcp:disconnectMcpServer', name)).success
}

export async function reconnectMcpServer(config: McpConfigSchema): Promise<[boolean, string]> {
  const { serverName } = config

  const resp = await emitter.invoke('mcp:reconnectMcpServer', serverName, config)

  return [resp.success, resp.success ? '' : resp.msg]
}

export async function fetchMcpServerTools(name: string) {
  const resp = await emitter.invoke('mcp:fetchMcpServerTools', name)
  if (resp.success) {
    return resp.data
  }

  console.error('fetchMcpServerTools fail', resp.msg)
  return []
}
