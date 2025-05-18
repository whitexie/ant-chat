import { eq } from 'drizzle-orm'
import { db } from '../db'
import {
  customModelsTable,
} from '../schema'

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
