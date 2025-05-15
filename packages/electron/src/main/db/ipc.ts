import { dbIpcEvents } from '@ant-chat/shared/ipc-events'
import { ipcMain } from 'electron'
import { createIpcPaginatedResponse, createIpcResponse, mainListener } from '../utils/ipc-events-bus'
import { logger } from '../utils/logger'
import * as actions from './actions'
import db from './db'
import { migrateFromIndexedDB } from './migrations'
import { messageInsertSchema, messageUpdateSchema } from './schema'

// 注册所有数据库操作的IPC处理函数
export function registerDbIpcHandlers() {
  // ========== 数据迁移 ==========
  ipcMain.handle(dbIpcEvents.MIGRATE_FROM_INDEXEDDB, async (_, data) => {
    try {
      const result = await migrateFromIndexedDB(db, data)
      return { success: true, data: result }
    }
    catch (error) {
      logger.error('迁移数据失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // ========== 会话操作 ==========
  mainListener.handle('db:get-conversations', async (_e, pageIndex, pageSize) => {
    try {
      const total = await actions.getConversationsTotal()
      const data = await actions.getConversations(pageIndex, pageSize)
      return createIpcPaginatedResponse(true, data, '', total)
    }
    catch (error) {
      logger.error('获取会话列表失败:', error)
      return createIpcPaginatedResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:get-conversation-by-id', async (_, id) => {
    try {
      const data = await actions.getConversationById(id)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取会话详情失败:', error)
      return createIpcResponse(true, null, (error as Error).message)
    }
  })

  mainListener.handle('db:add-conversation', async (_, conversation) => {
    try {
      // 确保所有必需的字段都存在
      if (!conversation.id || !conversation.title || !conversation.createAt || !conversation.updateAt) {
        return createIpcResponse(false, null, '会话信息不完整')
      }

      const data = await actions.addConversation(conversation as any)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加会话失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:update-conversation', async (_, conversation) => {
    try {
      const data = await actions.updateConversation(conversation)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('更新会话失败:', error)
      return createIpcResponse(true, null, (error as Error).message)
    }
  })

  mainListener.handle('db:delete-conversation', async (_, id) => {
    try {
      await actions.deleteConversation(id)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除会话失败:', error)
      return createIpcResponse(true, null, (error as Error).message)
    }
  })

  // ========== 消息操作 ==========
  mainListener.handle('db:get-message-by-convid', async (_, id) => {
    try {
      const data = await actions.getMessagesByConvId(id)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取消息失败:', error)
      return createIpcResponse(true, null, (error as Error).message)
    }
  })

  mainListener.handle('db:get-message-by-id', async (_, id) => {
    try {
      const data = await actions.getMessageById(id)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取消息失败:', error)
      return createIpcResponse(true, null, (error as Error).message)
    }
  })

  mainListener.handle('db:add-message', async (_, message) => {
    try {
      const msg = messageInsertSchema.parse(message)
      const data = await actions.addMessage(msg)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加消息失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:update-message', async (_, message) => {
    try {
      const msg = messageUpdateSchema.parse(message)
      const data = await actions.updateMessage(msg)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('更新消息失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:delete-message', async (_, id) => {
    try {
      await actions.deleteMessage(id)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除消息失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:get-messages-by-conv-id-with-pagination', async (_, id, pageIndex, pageSize) => {
    try {
      const { data, total } = await actions.getMessagesByConvIdWithPagination(id, pageIndex, pageSize)
      return createIpcPaginatedResponse(true, data, '', total)
    }
    catch (error) {
      logger.error(`分页获取会话消息失败. convId: ${id}`, error)
      return createIpcPaginatedResponse(true, null, (error as Error).message, 0)
    }
  })

  mainListener.handle('db:batch-delete-messages', async (_, ids) => {
    try {
      await actions.batchDeleteMessages(ids)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('批量删除消息失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  // ========== 自定义模型操作 ==========
  ipcMain.handle(dbIpcEvents.GET_CUSTOM_MODELS, async () => {
    try {
      const result = await actions.getCustomModels()
      return { success: true, data: result }
    }
    catch (error) {
      logger.error('获取自定义模型失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.ADD_CUSTOM_MODEL, async (_, model) => {
    try {
      await actions.addCustomModel(model)
      return { success: true }
    }
    catch (error) {
      logger.error('添加自定义模型失败:', error)
      return { success: false, error: String(error) }
    }
  })

  ipcMain.handle(dbIpcEvents.DELETE_CUSTOM_MODEL, async (_, id) => {
    try {
      await actions.deleteCustomModel(id)
      return { success: true }
    }
    catch (error) {
      logger.error('删除自定义模型失败:', error)
      return { success: false, error: String(error) }
    }
  })

  // ========== MCP配置操作 ==========
  mainListener.handle('db:get-mcp-configs', async () => {
    try {
      const data = await actions.getMcpConfigs()
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取MCP配置失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:get-mcp-config-by-server-name', async (_, serverName) => {
    try {
      const data = await actions.getMcpConfigByServerName(serverName)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取MCP配置详情失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:add-mcp-config', async (_, config) => {
    try {
      const data = await actions.addMcpConfig(config)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加MCP配置失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  mainListener.handle('db:update-mcp-config', async (_, config) => {
    try {
      const data = await actions.updateMcpConfig(config)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('更新MCP配置失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })

  ipcMain.handle('db:delete-mcp-config', async (_, serverName) => {
    try {
      await actions.deleteMcpConfig(serverName)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除MCP配置失败:', error)
      return createIpcResponse(false, null, (error as Error).message)
    }
  })
}
