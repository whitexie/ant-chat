import type {
  IConversations,
  IMessage,
} from '@ant-chat/shared/interfaces/db-types'
import type { ConversationsInsertSchema, ConversationsUpdateSchema, McpConfigsInsertSchema, McpConfigsSelectSchema, McpConfigsUpdateSchema, MessageInserSchema, MessageUpdateSchema } from './schema'
import { eq, sql } from 'drizzle-orm'
import db from './db'
import { conversationsInsertSchema, conversationsTable, conversationsUpdateSchema, customModelsTable, mcpConfigsInsertSchema, mcpConfigsSelectSchema, mcpConfigsTable, mcpConfigsUpdateSchema, messageInsertSchema, messagesTable, messageUpdateSchema } from './schema'

// ==================== 会话操作 ====================
export async function getConversationsTotal() {
  const result = db.select({ count: sql<number>`count(1)` }).from(conversationsTable).get()
  return result?.count ?? 0
}

export async function getConversations(pageIndex: number, pageSize: number = 10): Promise<IConversations[]> {
  const results = await db.select()
    .from(conversationsTable)
    .orderBy(sql`${conversationsTable.updateAt} DESC`)
    .limit(pageSize)
    .offset((pageIndex - 1) * pageSize)

  return results as IConversations[]
}

export async function getConversationById(id: string): Promise<IConversations> {
  const result = db.select().from(conversationsTable).where(eq(conversationsTable.id, id)).get()
  if (!result) {
    throw new Error(`${id} 不存在`)
  }
  return result as IConversations
}

export async function addConversation(conversation: ConversationsInsertSchema): Promise<IConversations> {
  const parsed = conversationsInsertSchema.parse(conversation)
  const result = db.insert(conversationsTable)
    .values(parsed)
    .returning()
    .get()
  return result as IConversations
}

export async function updateConversation(conversation: ConversationsUpdateSchema): Promise<IConversations> {
  const data = conversationsUpdateSchema.parse(conversation)
  const result = db.update(conversationsTable)
    .set(data)
    .where(eq(conversationsTable.id, data.id))
    .returning()
    .get()

  return result as IConversations
}

export async function deleteConversation(id: string): Promise<boolean> {
  const result = db.delete(conversationsTable)
    .where(eq(conversationsTable.id, id))
    .returning()
    .get()
  if (!result)
    throw new Error('会话未找到')

  return true
}

export async function updateConversationUpdateAt(id: string, updateAt: number): Promise<IConversations> {
  const data = conversationsUpdateSchema.parse({ id, updateAt })
  const result = db.update(conversationsTable)
    .set(data)
    .where(eq(conversationsTable.id, id))
    .returning()
    .get()

  return result as IConversations
}

// ==================== 消息操作 ====================
export async function getMessagesByConvId(convId: string): Promise<IMessage[]> {
  const data = await db.select().from(messagesTable).where(eq(messagesTable.convId, convId))

  return data as IMessage[]
}

export async function getMessageById(id: string): Promise<IMessage> {
  const result = db.select().from(messagesTable).where(eq(messagesTable.id, id)).get()

  if (!result) {
    throw new Error('消息未找到')
  }

  return result as IMessage
}

export async function addMessage(message: MessageInserSchema): Promise<IMessage> {
  const data = messageInsertSchema.parse(message)

  // 先检查对应的会话是否存在
  const conversation = await getConversationById(message.convId)
  if (!conversation) {
    throw new Error('会话未找到')
  }

  const result = db.insert(messagesTable)
    .values({ ...data, createAt: Date.now() })
    .returning()
    .get()

  return result as IMessage
}

export async function updateMessage(message: MessageUpdateSchema): Promise<IMessage> {
  const data = messageUpdateSchema.parse(message)

  await db.transaction(async (tx) => {
    await tx.update(messagesTable).set(data).where(eq(messagesTable.id, data.id))
    await tx.update(conversationsTable).set({ updateAt: Date.now() }).where(eq(conversationsTable.id, data.convId))
  })

  return getMessageById(message.id)
}

export async function deleteMessage(id: string): Promise<boolean> {
  await db.delete(messagesTable)
    .where(eq(messagesTable.id, id))

  return true
}

export async function getMessagesByConvIdWithPagination(id: string, pageIndex: number, pageSize: number): Promise<{ data: IMessage[], total: number }> {
  // 获取总记录数
  const countResult = db.select({ count: sql<number>`count(1)` })
    .from(messagesTable)
    .where(eq(messagesTable.convId, id))
    .get()

  const total = countResult ? Number(countResult.count) : 0

  // 获取分页数据
  const results = db.select()
    .from(messagesTable)
    .where(eq(messagesTable.convId, id))
    .orderBy(messagesTable.createAt)
    .limit(pageSize)
    .offset(pageIndex * pageSize)
    .all()

  return {
    data: results as IMessage[],
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

export async function addMcpConfig(config: McpConfigsInsertSchema): Promise<any> {
  const data = mcpConfigsInsertSchema.parse(config)

  return db.insert(mcpConfigsTable)
    .values({ ...data, createAt: Date.now(), updateAt: Date.now() })
    .returning()
    .get()
}

export async function updateMcpConfig(config: McpConfigsUpdateSchema): Promise<any> {
  const data = mcpConfigsUpdateSchema.parse(config)
  return db.update(mcpConfigsTable)
    .set(data)
    .where(eq(mcpConfigsTable.serverName, config.serverName))
    .returning()
    .get()
}

export async function deleteMcpConfig(serverName: string): Promise<McpConfigsSelectSchema> {
  const data = db.delete(mcpConfigsTable)
    .where(eq(mcpConfigsTable.serverName, serverName))
    .returning()
    .get()

  return mcpConfigsSelectSchema.parse(data)
}
