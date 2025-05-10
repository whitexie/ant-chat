import type { BetterSQLite3Database } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

// 从旧的IndexedDB迁移数据到SQLite
export async function migrateFromIndexedDB(db: BetterSQLite3Database<typeof schema>, indexedDbData: any) {
  try {
    // 迁移会话数据
    if (indexedDbData.conversations && indexedDbData.conversations.length > 0) {
      for (const conv of indexedDbData.conversations) {
        const settings = conv.settings ? JSON.stringify(conv.settings) : null

        await db.insert(schema.conversationsTable)
          .values({
            id: conv.id,
            title: conv.title,
            createAt: conv.createAt,
            updateAt: conv.updateAt,
            settings,
          })
          .returning()
      }
    }

    // 迁移消息数据
    if (indexedDbData.messages && indexedDbData.messages.length > 0) {
      for (const msg of indexedDbData.messages) {
        await db.insert(schema.messagesTable)
          .values({
            id: msg.id,
            convId: msg.convId,
            role: msg.role,
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
            createAt: msg.createAt,
            status: msg.status,
            images: msg.images ? JSON.stringify(msg.images) : null,
            attachments: msg.attachments ? JSON.stringify(msg.attachments) : null,
            reasoningContent: msg.reasoningContent,
            mcpTool: msg.mcpTool ? JSON.stringify(msg.mcpTool) : null,
            modelInfo: msg.modelInfo ? JSON.stringify(msg.modelInfo) : null,
          })
          .returning()
      }
    }

    // 迁移自定义模型数据
    if (indexedDbData.customModels && indexedDbData.customModels.length > 0) {
      for (const model of indexedDbData.customModels) {
        await db.insert(schema.customModelsTable)
          .values({
            id: model.id,
            ownedBy: model.ownedBy,
            createAt: model.createAt,
          })
          .returning()
      }
    }

    // 迁移MCP配置数据
    if (indexedDbData.mcpConfigs && indexedDbData.mcpConfigs.length > 0) {
      for (const config of indexedDbData.mcpConfigs) {
        await db.insert(schema.mcpConfigsTable)
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
      }
    }

    return true
  }
  catch (error) {
    console.error('数据迁移失败:', error)
    return false
  }
}
