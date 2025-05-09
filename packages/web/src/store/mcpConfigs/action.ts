import type { McpConfig, McpServerStatus } from '@/db/interface'
import { addMcpConfig, deleteMcpConfig, getAllMcpConfigs, getMcpConfigByName, updateMcpConfig } from '@/db/mcpConfigActions'
import { connectMcpServer, disconnectMcpServer } from '@/mcp'
import { produce } from 'immer'
import { useMcpConfigsStore } from './store'

export async function initializeMcpConfigs() {
  const list = await getAllMcpConfigs()

  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    const length = draft.mcpConfigs.length
    draft.mcpConfigs.splice(0, length, ...list)
  }))
}

export async function addMcpConfigAction(config: McpConfig) {
  const [ok, msg] = await addMcpConfig(config)
  if (!ok) {
    return [ok, msg]
  }
  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    draft.mcpConfigs.push(config)
  }))

  return [ok, '']
}

export async function upadteMcpConfigAction(config: McpConfig) {
  const id = await updateMcpConfig(config)
  if (!id) {
    console.warn('更新失败: ', JSON.stringify(config))
    return
  }
  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    const index = draft.mcpConfigs.findIndex(item => item.serverName === config.serverName)
    if (index > -1) {
      draft.mcpConfigs[index] = config
    }
  }))
}

export async function deleteMcpConfigAction(name: string) {
  await deleteMcpConfig(name)

  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    draft.mcpConfigs = draft.mcpConfigs.filter(item => item.serverName !== name)
  }))
}

export async function connectMcpServerAction(name: string) {
  const config = await getMcpConfigByName(name)
  if (!config) {
    throw new Error(`connect McpServer fail. ${name} nout found.`)
  }

  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    draft.mcpServerRuningStatusMap[name] = 'connecting'
  }))

  const [ok] = await connectMcpServer(config)
  const mcpServerState = ok === true ? 'connected' : 'disconnected'

  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    draft.mcpServerRuningStatusMap[name] = mcpServerState
  }))
}

export async function disconnectMcpServerAction(name: string) {
  const ok = await disconnectMcpServer(name)

  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    delete draft.mcpServerRuningStatusMap[name]
  }))
  return ok
}

export async function reconnectMcpServerAction(name: string) {
  const config = await getMcpConfigByName(name)
  if (!config) {
    throw new Error(`connect McpServer fail. ${name} nout found.`)
  }

  await disconnectMcpServerAction(name)
  await connectMcpServerAction(name)
}

export async function onMcpServerStatusChanged(_: Electron.IpcRendererEvent, name: string, status: McpServerStatus) {
  console.log('onMcpServerStatusChanged => ', name, status)
  const mcpConfig = await getMcpConfigByName(name)
  if (!mcpConfig) {
    return
  }

  useMcpConfigsStore.setState(state => produce(state, (draft) => {
    if (status === 'disconnected') {
      delete draft.mcpServerRuningStatusMap[name]
    }
    else {
      draft.mcpServerRuningStatusMap[name] = status
    }
  }))
}
