import {
  AddMessage,
  createErrorIpcResponse,
  createIpcPaginatedResponse,
  createIpcResponse,
  UpdateMessageSchema,
} from '@ant-chat/shared'
import { services } from '../db'
import { mainListener } from '../utils/ipc-events-bus'
import { logger } from '../utils/logger'

// 注册所有数据库操作的IPC处理函数
export function registerDbHandlers() {
  // ============================ 会话操作 ============================
  mainListener.handle('db:get-conversations', async (_e, pageIndex, pageSize) => {
    try {
      const total = await services.getConversationsTotal()
      const data = await services.getConversations(pageIndex, pageSize)
      return createIpcPaginatedResponse(true, data, '', total)
    }
    catch (error) {
      logger.error('获取会话列表失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:get-conversation-by-id', async (_, id) => {
    try {
      const data = await services.getConversationById(id)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取会话详情失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:add-conversation', async (_, conversation) => {
    try {
      // 确保所有必需的字段都存在
      if (!conversation.id || !conversation.title || !conversation.createdAt || !conversation.updatedAt) {
        return createErrorIpcResponse('会话信息不完整')
      }

      const data = await services.addConversation(conversation as any)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加会话失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:update-conversation', async (_, conversation) => {
    try {
      const data = await services.updateConversation(conversation)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('更新会话失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:delete-conversation', async (_, id) => {
    try {
      await services.deleteConversation(id)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除会话失败:', error)
      return createErrorIpcResponse((error as Error))
    }
  })

  // ============================ 消息操作 ============================
  mainListener.handle('db:get-message-by-convid', async (_, id) => {
    try {
      const data = await services.getMessagesByConvId(id)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取消息失败:', error)
      return createErrorIpcResponse((error as Error))
    }
  })

  mainListener.handle('db:get-message-by-id', async (_, id) => {
    try {
      const data = await services.getMessageById(id)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取消息失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:add-message', async (_, message) => {
    try {
      const msg = AddMessage.parse(message)
      const data = await services.addMessage(msg)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加消息失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:update-message', async (_, message) => {
    try {
      const msg = UpdateMessageSchema.parse(message)
      const data = await services.updateMessage(msg)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('更新消息失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:delete-message', async (_, id) => {
    try {
      await services.deleteMessage(id)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除消息失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:get-messages-by-conv-id-with-pagination', async (_, id, pageIndex, pageSize) => {
    try {
      const { data, total } = await services.getMessagesByConvIdWithPagination(id, pageIndex, pageSize)
      return createIpcPaginatedResponse(true, data, '', total)
    }
    catch (error) {
      logger.error(`分页获取会话消息失败. convId: ${id}`, error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:batch-delete-messages', async (_, ids) => {
    try {
      await services.batchDeleteMessages(ids)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('批量删除消息失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  // ============================ 自定义模型操作 ============================
  mainListener.handle('db:get-custom-models', async () => {
    try {
      const data = await services.getCustomModels()
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取自定义模型失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:add-model', async (_, model) => {
    try {
      const data = await services.addCustomModel(model)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加自定义模型失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:delete-model', async (_, id) => {
    try {
      await services.deleteCustomModel(id)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除自定义模型失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  // ============================ MCP配置操作 ============================
  mainListener.handle('db:get-mcp-configs', async () => {
    try {
      const data = await services.getMcpConfigs()
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取MCP配置失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:get-mcp-config-by-server-name', async (_, serverName) => {
    try {
      const data = await services.getMcpConfigByServerName(serverName)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('获取MCP配置详情失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:add-mcp-config', async (_, config) => {
    try {
      const data = await services.addMcpConfig(config)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('添加MCP配置失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:update-mcp-config', async (_, config) => {
    try {
      const data = await services.updateMcpConfig(config)
      return createIpcResponse(true, data)
    }
    catch (error) {
      logger.error('更新MCP配置失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })

  mainListener.handle('db:delete-mcp-config', async (_, serverName) => {
    try {
      await services.deleteMcpConfig(serverName)
      return createIpcResponse(true, null)
    }
    catch (error) {
      logger.error('删除MCP配置失败:', error)
      return createErrorIpcResponse(error as Error)
    }
  })
}
