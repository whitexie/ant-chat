import type { McpConfigSchema } from '@ant-chat/shared'
import { getNow } from '@/utils'
import { dbApi } from './dbApi'

export async function getAllMcpConfigs() {
  const response = await dbApi.getMcpConfigs()
  if (!response.success || !response.data) {
    return []
  }
  return response.data.sort((a: McpConfigSchema, b: McpConfigSchema) => b.updateAt - a.updateAt)
}

export async function getMcpConfigByName(name: string) {
  const response = await dbApi.getMcpConfigByServerName(name)
  return response.success ? response.data : null
}

export async function mcpConfigIsExists(serverName: string) {
  const response = await dbApi.getMcpConfigByServerName(serverName)
  return response.success && !!response.data
}

export async function addMcpConfig(config: McpConfigSchema) {
  if (await mcpConfigIsExists(config.serverName)) {
    return [false, `${config.serverName} 已存在`]
  }
  const response = await dbApi.addMcpConfig(config)
  return [response.success, response.success ? '' : '添加失败']
}

export async function updateMcpConfig(config: McpConfigSchema) {
  const updatedConfig = { ...config, updateAt: getNow() }
  const response = await dbApi.updateMcpConfig(updatedConfig)
  return response.success ? response.data : null
}

export async function deleteMcpConfig(serverName: string) {
  return dbApi.deleteMcpConfig(serverName)
}
