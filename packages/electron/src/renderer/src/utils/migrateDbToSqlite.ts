// import db from '@/db/db'
// import { dbApi } from '@/db/dbApi'

/**
 * 将IndexedDB中的数据迁移到SQLite
 * 仅在Electron环境中有效
 */
// export async function migrateToSqlite() {
//   try {
//     // 从IndexedDB导出数据
//     console.log('正在从IndexedDB导出数据...')

//     // 获取所有会话
//     const conversations = await db.conversations.toArray()

//     // 获取所有消息
//     const messages = await db.messages.toArray()

//     // 获取所有自定义模型
//     const customModels = await db.customModels?.toArray() || []

//     // 获取所有MCP配置
//     const mcpConfigs = await db.mcpConfigs?.toArray() || []

//     const data = {
//       conversations,
//       messages,
//       customModels,
//       mcpConfigs,
//     }

//     console.log('数据导出完成，准备导入到SQLite...')
//     console.log(`会话数量: ${conversations.length}`)
//     console.log(`消息数量: ${messages.length}`)
//     console.log(`自定义模型数量: ${customModels.length}`)
//     console.log(`MCP配置数量: ${mcpConfigs.length}`)

//     // 判断是否需要迁移
//     if (conversations.length === 0 && messages.length === 0 && customModels.length === 0 && mcpConfigs.length === 0) {
//       console.log('没有需要迁移的数据')
//       return true
//     }

//     // 将数据导入到SQLite
//     const response = await dbApi.migrateFromIndexedDB(data)

//     if (!response.success) {
//       throw new Error(`迁移失败: ${response.error}`)
//     }

//     console.log('数据迁移完成!')
//     // 清空 IndexedDB 数据库
//     await db.conversations.clear()
//     await db.messages.clear()
//     await db.customModels?.clear()
//     await db.mcpConfigs?.clear()
//     console.log('IndexedDB 数据库已清空')
//     return true
//   }
//   catch (error) {
//     console.error('数据迁移失败:', error)
//     throw error
//   }
// }
