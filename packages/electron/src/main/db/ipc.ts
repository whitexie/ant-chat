import { dbIpcEvents } from '@ant-chat/shared/ipc-events'
import { ipcMain } from 'electron'
import * as actions from './actions'
import db from './db'
import { migrateFromIndexedDB } from './migrations'

// 注册所有数据库操作的IPC处理函数
export function registerDbIpcHandlers() {
  // ========== 数据迁移 ==========
  ipcMain.handle(dbIpcEvents.MIGRATE_FROM_INDEXEDDB, async (_, data) => {
    try {
      const result = await migrateFromIndexedDB(db, data)
      return { success: true, data: result }
    }
    catch (error) {
      console.error('迁移数据失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // ========== 会话操作 ==========
  ipcMain.handle(dbIpcEvents.GET_CONVERSATIONS, async () => {
    try {
      const result = await actions.getConversations()
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取会话列表失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.GET_CONVERSATION_BY_ID, async (_, id) => {
    try {
      const result = await actions.getConversationById(id)
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取会话详情失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.ADD_CONVERSATION, async (_, conversation) => {
    try {
      await actions.addConversation(conversation)
      return { success: true }
    }
    catch (error) {
      console.error('添加会话失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.UPDATE_CONVERSATION, async (_, conversation) => {
    try {
      await actions.updateConversation(conversation)
      return { success: true }
    }
    catch (error) {
      console.error('更新会话失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.DELETE_CONVERSATION, async (_, id) => {
    try {
      await actions.deleteConversation(id)
      return { success: true }
    }
    catch (error) {
      console.error('删除会话失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // ========== 消息操作 ==========
  ipcMain.handle(dbIpcEvents.GET_MESSAGE_BY_ID, async (_, id) => {
    try {
      const result = await actions.getMessageById(id)
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.ADD_MESSAGE, async (_, message) => {
    try {
      await actions.addMessage(message)
      return { success: true }
    }
    catch (error) {
      console.error('添加消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.UPDATE_MESSAGE, async (_, message) => {
    try {
      await actions.updateMessage(message)
      return { success: true }
    }
    catch (error) {
      console.error('更新消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.DELETE_MESSAGE, async (_, id) => {
    try {
      await actions.deleteMessage(id)
      return { success: true }
    }
    catch (error) {
      console.error('删除消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.GET_MESSAGES_BY_CONV_ID, async (_, id) => {
    try {
      const result = await actions.getMessagesByConvId(id)
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取会话消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.GET_MESSAGES_BY_CONV_ID_WITH_PAGINATION, async (_, id, pageIndex, pageSize) => {
    try {
      const result = await actions.getMessagesByConvIdWithPagination(id, pageIndex, pageSize)
      return { success: true, data: result }
    }
    catch (error) {
      console.error('分页获取会话消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.BATCH_DELETE_MESSAGES, async (_, ids) => {
    try {
      await actions.batchDeleteMessages(ids)
      return { success: true }
    }
    catch (error) {
      console.error('批量删除消息失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // ========== 自定义模型操作 ==========
  ipcMain.handle(dbIpcEvents.GET_CUSTOM_MODELS, async () => {
    try {
      const result = await actions.getCustomModels()
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取自定义模型失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.ADD_CUSTOM_MODEL, async (_, model) => {
    try {
      await actions.addCustomModel(model)
      return { success: true }
    }
    catch (error) {
      console.error('添加自定义模型失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.DELETE_CUSTOM_MODEL, async (_, id) => {
    try {
      await actions.deleteCustomModel(id)
      return { success: true }
    }
    catch (error) {
      console.error('删除自定义模型失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // ========== MCP配置操作 ==========
  ipcMain.handle(dbIpcEvents.GET_MCP_CONFIGS, async () => {
    try {
      const result = await actions.getMcpConfigs()
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取MCP配置失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.GET_MCP_CONFIG_BY_SERVER_NAME, async (_, serverName) => {
    try {
      const result = await actions.getMcpConfigByServerName(serverName)
      return { success: true, data: result }
    }
    catch (error) {
      console.error('获取MCP配置详情失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.ADD_MCP_CONFIG, async (_, config) => {
    try {
      await actions.addMcpConfig(config)
      return { success: true }
    }
    catch (error) {
      console.error('添加MCP配置失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.UPDATE_MCP_CONFIG, async (_, config) => {
    try {
      await actions.updateMcpConfig(config)
      return { success: true }
    }
    catch (error) {
      console.error('更新MCP配置失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.DELETE_MCP_CONFIG, async (_, serverName) => {
    try {
      await actions.deleteMcpConfig(serverName)
      return { success: true }
    }
    catch (error) {
      console.error('删除MCP配置失败:', error)
      return { success: false, error: String(error) }
    }
  })
}
