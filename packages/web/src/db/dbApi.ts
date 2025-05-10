import { dbIpcEvents } from '@ant-chat/shared/ipc-events'

/**
 * 数据库操作 API
 * 使用 IPC 与主进程通信进行数据库操作
 */
export const dbApi = {
  // 数据迁移
  migrateFromIndexedDB: async (data: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.MIGRATE_FROM_INDEXEDDB, data)
  },

  // 会话操作
  getConversations: async () => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_CONVERSATIONS)
  },

  getConversationById: async (id: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_CONVERSATION_BY_ID, id)
  },

  addConversation: async (conversation: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.ADD_CONVERSATION, conversation)
  },

  updateConversation: async (conversation: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.UPDATE_CONVERSATION, conversation)
  },

  deleteConversation: async (id: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.DELETE_CONVERSATION, id)
  },

  // 消息操作
  getMessageById: async (id: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_MESSAGE_BY_ID, id)
  },

  addMessage: async (message: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.ADD_MESSAGE, message)
  },

  updateMessage: async (message: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.UPDATE_MESSAGE, message)
  },

  deleteMessage: async (id: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.DELETE_MESSAGE, id)
  },

  getMessagesByConvId: async (id: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_MESSAGES_BY_CONV_ID, id)
  },

  getMessagesByConvIdWithPagination: async (id: string, pageIndex: number, pageSize: number) => {
    return window.electronAPI.ipcRenderer.invoke(
      dbIpcEvents.GET_MESSAGES_BY_CONV_ID_WITH_PAGINATION,
      id,
      pageIndex,
      pageSize,
    )
  },

  batchDeleteMessages: async (ids: string[]) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.BATCH_DELETE_MESSAGES, ids)
  },

  // 自定义模型操作
  getCustomModels: async () => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_CUSTOM_MODELS)
  },

  addCustomModel: async (model: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.ADD_CUSTOM_MODEL, model)
  },

  deleteCustomModel: async (id: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.DELETE_CUSTOM_MODEL, id)
  },

  // MCP配置操作
  getMcpConfigs: async () => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_MCP_CONFIGS)
  },

  getMcpConfigByServerName: async (serverName: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.GET_MCP_CONFIG_BY_SERVER_NAME, serverName)
  },

  addMcpConfig: async (config: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.ADD_MCP_CONFIG, config)
  },

  updateMcpConfig: async (config: any) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.UPDATE_MCP_CONFIG, config)
  },

  deleteMcpConfig: async (serverName: string) => {
    return window.electronAPI.ipcRenderer.invoke(dbIpcEvents.DELETE_MCP_CONFIG, serverName)
  },
}
