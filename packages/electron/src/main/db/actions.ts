import type {
  IConversations,
  IMessage,
  IMessageAI,
  IMessageSystem,
  IMessageUser,
  Role,
} from '@ant-chat/shared/interfaces/db-types'
import type { DbMessageInsert, DbMessageSelect } from './schema'
import { eq, sql } from 'drizzle-orm'
import db from './db'
import { conversationsTable, customModelsTable, mcpConfigsTable, messagesTable } from './schema'

// ==================== 会话操作 ====================
export async function getConversations(): Promise<IConversations[]> {
  const results = await db.select().from(conversationsTable).orderBy(conversationsTable.updateAt)
  return results.map(result => ({
    ...result,
    settings: result.settings ? JSON.parse(result.settings) : undefined,
  }))
}

export async function getConversationById(id: string): Promise<IConversations | undefined> {
  const result = await db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).get()
  if (!result)
    return undefined
  return {
    ...result,
    settings: result.settings ? JSON.parse(result.settings) : undefined,
  }
}

export async function addConversation(conversation: IConversations): Promise<IConversations> {
  const result = await db.insert(conversationsTable)
    .values({
      id: conversation.id,
      title: conversation.title,
      createAt: conversation.createAt,
      updateAt: conversation.updateAt,
      settings: conversation.settings ? JSON.stringify(conversation.settings) : null,
    })
    .returning()
    .get()
  return {
    ...result,
    settings: result.settings ? JSON.parse(result.settings) : undefined,
  }
}

export async function updateConversation(conversation: Pick<IConversations, 'id' | 'title' | 'updateAt' | 'settings'>): Promise<IConversations> {
  const result = await db.update(conversationsTable)
    .set({
      title: conversation.title,
      updateAt: conversation.updateAt,
      settings: conversation.settings ? JSON.stringify(conversation.settings) : null,
    })
    .where(eq(conversationsTable.id, conversation.id))
    .returning()
    .get()

  return {
    ...result,
    settings: result.settings ? JSON.parse(result.settings) : undefined,
  }
}

export async function deleteConversation(id: string): Promise<IConversations> {
  const result = await db.delete(conversationsTable)
    .where(eq(conversationsTable.id, id))
    .returning()
    .get()
  if (!result)
    throw new Error('会话未找到')
  return {
    ...result,
    settings: result.settings ? JSON.parse(result.settings) : undefined,
  }
}

export async function updateConversationUpdateAt(id: string, updateAt: number): Promise<IConversations> {
  const result = db.update(conversationsTable)
    .set({ updateAt })
    .where(eq(conversationsTable.id, id))
    .returning()
    .get()

  return { ...result, settings: result.settings ? JSON.parse(result.settings) : undefined }
}

// ==================== 消息操作 ====================
export async function getMessageById(id: string): Promise<IMessage> {
  const result = await db.select().from(messagesTable).where(eq(messagesTable.id, id)).get()

  if (!result) {
    throw new Error('消息未找到')
  }

  return dbMessageToIMessage(result)
}

export async function addMessage(message: IMessage): Promise<IMessage> {
  // 先检查对应的会话是否存在
  const conversation = await getConversationById(message.convId)
  if (!conversation) {
    throw new Error('会话未找到')
  }

  const result = await db.insert(messagesTable)
    .values(IMessageToDbMessage(message))
    .returning()
    .get()

  return dbMessageToIMessage(result)
}

export async function updateMessage(message: IMessage): Promise<IMessage> {
  await updateConversationUpdateAt(message.convId, Date.now())

  const result = await db.update(messagesTable)
    .set(IMessageToDbMessage(message))
    .where(eq(messagesTable.id, message.id))
    .returning()
    .get()

  return dbMessageToIMessage(result)
}

export async function deleteMessage(id: string): Promise<boolean> {
  const result = await db.delete(messagesTable)
    .where(eq(messagesTable.id, id))
    .returning()
    .get()

  return !!result // 确保返回布尔值
}

export async function getMessagesByConvId(id: string): Promise<IMessage[]> {
  const results = await db.select()
    .from(messagesTable)
    .where(eq(messagesTable.convId, id))
    .orderBy(messagesTable.createAt)
    .all()

  return results.map(dbMessageToIMessage)
}

export async function getMessagesByConvIdWithPagination(id: string, pageIndex: number, pageSize: number): Promise<{ messages: IMessage[], total: number }> {
  // 获取总记录数
  const countResult = await db.select({ count: sql<number>`count(1)` })
    .from(messagesTable)
    .where(eq(messagesTable.convId, id))
    .get()

  const total = countResult ? Number(countResult.count) : 0

  // 获取分页数据
  const results = await db.select()
    .from(messagesTable)
    .where(eq(messagesTable.convId, id))
    .orderBy(messagesTable.createAt)
    .limit(pageSize)
    .offset(pageIndex * pageSize)
    .all()

  return {
    messages: results.map(dbMessageToIMessage),
    total,
  }
}

export async function batchDeleteMessages(ids: string[]): Promise<boolean> {
  for (const id of ids) {
    await deleteMessage(id)
  }
  return true
}

// ==================== 自定义模型操作 ====================
export async function getCustomModels(): Promise<any[]> {
  return db.select().from(customModelsTable).all()
}

export async function addCustomModel(model: { id: string, ownedBy: string, createAt: number }): Promise<any> {
  return db.insert(customModelsTable)
    .values({
      id: model.id,
      ownedBy: model.ownedBy,
      createAt: model.createAt,
    })
    .returning()
    .get()
}

export async function deleteCustomModel(id: string): Promise<any> {
  return db.delete(customModelsTable)
    .where(eq(customModelsTable.id, id))
    .returning()
    .get()
}

// ==================== MCP配置操作 ====================
export async function getMcpConfigs(): Promise<any[]> {
  return db.select().from(mcpConfigsTable).all()
}

export async function getMcpConfigByServerName(serverName: string): Promise<any> {
  return db.select()
    .from(mcpConfigsTable)
    .where(eq(mcpConfigsTable.serverName, serverName))
    .get()
}

export async function addMcpConfig(config: any): Promise<any> {
  return db.insert(mcpConfigsTable)
    .values({
      serverName: config.serverName,
      icon: config.icon,
      description: config.description,
      timeout: config.timeout,
      transportType: config.transportType,
      createAt: config.createAt,
      updateAt: config.updateAt,
      url: config.url,
      command: config.command,
      args: config.args ? JSON.stringify(config.args) : null,
      env: config.env ? JSON.stringify(config.env) : null,
    })
    .returning()
    .get()
}

export async function updateMcpConfig(config: any): Promise<any> {
  return db.update(mcpConfigsTable)
    .set({
      icon: config.icon,
      description: config.description,
      timeout: config.timeout,
      transportType: config.transportType,
      updateAt: config.updateAt,
      url: config.url,
      command: config.command,
      args: config.args ? JSON.stringify(config.args) : null,
      env: config.env ? JSON.stringify(config.env) : null,
    })
    .where(eq(mcpConfigsTable.serverName, config.serverName))
    .returning()
    .get()
}

export async function deleteMcpConfig(serverName: string): Promise<any> {
  return db.delete(mcpConfigsTable)
    .where(eq(mcpConfigsTable.serverName, serverName))
    .returning()
    .get()
}

// ==================== 辅助函数 ====================

/**
 * 将数据库消息转换为 Web 端可用的消息格式
 * 解析 JSON 字符串字段为对象/数组
 */
function dbMessageToIMessage(dbMessage: DbMessageSelect): IMessage {
  const baseMessage = {
    id: dbMessage.id,
    convId: dbMessage.convId,
    createAt: dbMessage.createAt,
    role: dbMessage.role as Role, // 添加类型断言
    status: dbMessage.status,
  }

  let content: any = dbMessage.content
  if (typeof content === 'string' && (content.startsWith('[') || content.startsWith('{'))) {
    try {
      content = JSON.parse(content)
    }
    catch {
      // 保持原样
    }
  }

  switch (baseMessage.role) {
    case 'system':
      return {
        ...baseMessage,
        content: content as string,
      } as IMessageSystem

    case 'user': {
      let images: any[] = []
      if (dbMessage.images) {
        try {
          images = JSON.parse(dbMessage.images)
        }
        catch {
          images = []
        }
      }

      let attachments: any[] = []
      if (dbMessage.attachments) {
        try {
          attachments = JSON.parse(dbMessage.attachments)
        }
        catch {
          attachments = []
        }
      }

      return {
        ...baseMessage,
        content: content as string,
        images,
        attachments,
      } as IMessageUser
    }

    case 'assistant': {
      let mcpTool: any[] | undefined
      if (dbMessage.mcpTool) {
        try {
          mcpTool = JSON.parse(dbMessage.mcpTool)
        }
        catch {
          mcpTool = []
        }
      }

      let modelInfo: any
      if (dbMessage.modelInfo) {
        try {
          modelInfo = JSON.parse(dbMessage.modelInfo)
        }
        catch {
          modelInfo = null
        }
      }

      return {
        ...baseMessage,
        content,
        reasoningContent: dbMessage.reasoningContent,
        mcpTool,
        modelInfo,
      } as IMessageAI
    }

    default:
      return {
        ...baseMessage,
        content,
      } as IMessage
  }
}

function IMessageToDbMessage(message: IMessage): DbMessageInsert {
  if (message.role === 'system') {
    return {
      id: message.id,
      convId: message.convId,
      role: message.role,
      content: message.content,
      createAt: message.createAt,
      status: message.status,
      images: null,
      attachments: null,
      reasoningContent: null,
      mcpTool: null,
      modelInfo: null,
    }
  }
  else if (message.role === 'user') {
    return {
      id: message.id,
      convId: message.convId,
      role: message.role,
      content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
      createAt: message.createAt,
      status: message.status,
      images: message.images ? JSON.stringify(message.images) : null,
      attachments: message.attachments ? JSON.stringify(message.attachments) : null,
      reasoningContent: null,
      mcpTool: null,
      modelInfo: null,
    }
  }
  else {
    return {
      id: message.id,
      convId: message.convId,
      role: message.role,
      content: typeof message.content === 'string' ? message.content : JSON.stringify(message.content),
      createAt: message.createAt,
      status: message.status,
      images: null,
      attachments: null,
      reasoningContent: message.reasoningContent,
      mcpTool: message.mcpTool ? JSON.stringify(message.mcpTool) : null,
      modelInfo: message.modelInfo ? JSON.stringify(message.modelInfo) : null,
    }
  }
}
