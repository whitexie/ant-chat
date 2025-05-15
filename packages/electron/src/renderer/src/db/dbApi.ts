import type { IConversations, IMessage, McpConfig } from '@ant-chat/shared'
import type { IpcEvents } from 'src/types/db-ipc-even'
import { dbIpcEvents } from '@ant-chat/shared/ipc-events'
import { IpcEmitter } from '@electron-toolkit/typed-ipc/renderer'

const emitter = new IpcEmitter<IpcEvents>()

/**
 * 数据库操作 API
 * 使用 IPC 与主进程通信进行数据库操作
 */
export const dbApi = {
  // 会话操作
  getConversations: async (pageIndex: number, pageSize: number) => {
    return await emitter.invoke('db:get-conversations', pageIndex, pageSize)
  },

  getConversationById: async (id: string) => {
    return emitter.invoke('db:get-conversation-by-id', id)
  },

  addConversation: async (conversation: IConversations) => {
    return emitter.invoke('db:add-conversation', conversation)
  },

  updateConversation: async (conversation: IConversations) => {
    return emitter.invoke('db:update-conversation', conversation)
  },

  deleteConversation: async (id: string) => {
    return emitter.invoke('db:delete-conversation', id)
  },

  // 消息操作
  getMessagesByConvId: async (convId: string) => {
    return emitter.invoke('db:get-message-by-convid', convId)
  },
  getMessageById: async (id: string) => {
    return emitter.invoke('db:get-message-by-id', id)
  },

  addMessage: async (message: IMessage) => {
    return emitter.invoke('db:add-message', message)
  },

  updateMessage: async (message: IMessage) => {
    return emitter.invoke('db:update-message', message)
  },

  deleteMessage: async (id: string) => {
    return emitter.invoke('db:delete-message', id)
  },

  getMessagesByConvIdWithPagination: async (id: string, pageIndex: number, pageSize: number) => {
    return emitter.invoke(
      'db:get-messages-by-conv-id-with-pagination',
      id,
      pageIndex,
      pageSize,
    )
  },

  batchDeleteMessages: async (ids: string[]) => {
    return emitter.invoke('db:batch-delete-messages', ids)
  },

  // 自定义模型操作
  getCustomModels: async () => {
    return window.electron.ipcRenderer.invoke(dbIpcEvents.GET_CUSTOM_MODELS)
  },

  addCustomModel: async (model: any) => {
    return window.electron.ipcRenderer.invoke(dbIpcEvents.ADD_CUSTOM_MODEL, model)
  },

  deleteCustomModel: async (id: string) => {
    return window.electron.ipcRenderer.invoke(dbIpcEvents.DELETE_CUSTOM_MODEL, id)
  },

  // MCP配置操作
  getMcpConfigs: async () => {
    return emitter.invoke('db:get-mcp-configs')
  },

  getMcpConfigByServerName: async (serverName: string) => {
    return emitter.invoke('db:get-mcp-config-by-server-name', serverName)
  },

  addMcpConfig: async (config: McpConfig) => {
    return emitter.invoke('db:add-mcp-config', config)
  },

  updateMcpConfig: async (config: McpConfig) => {
    return emitter.invoke('db:update-mcp-config', config)
  },

  deleteMcpConfig: async (serverName: string) => {
    return emitter.invoke('db:delete-mcp-config', serverName)
  },
}
