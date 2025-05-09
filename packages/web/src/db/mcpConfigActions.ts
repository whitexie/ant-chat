import type { McpConfig } from './interface'
import { getNow } from '@/utils'
import db from './db'

export async function getAllMcpConfigs() {
  return (await db.mcpConfigs.toArray()).sort((a, b) => b.updateAt - a.updateAt)
}

export async function getMcpConfigByName(name: string) {
  return await db.mcpConfigs.get(name)
}

export async function mcpConfigIsExists(serverName: string) {
  return !!(await db.mcpConfigs.get(serverName))
}

export async function addMcpConfig(config: McpConfig) {
  if (await mcpConfigIsExists(config.serverName)) {
    return [false, `${config.serverName} 已存在`]
  }
  await db.mcpConfigs.add(config)
  return [true, '']
}

export async function updateMcpConfig(config: McpConfig) {
  return await db.mcpConfigs.put({ ...config, updateAt: getNow() })
}

export async function deleteMcpConfig(sereerName: string) {
  return await db.mcpConfigs.delete(sereerName)
}
