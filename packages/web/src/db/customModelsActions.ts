import type { IModel } from '@/services-provider/interface'
import db from './db'

function modelIsExist(id: string) {
  return !!db.customModels.get(id)
}

export function createCustomModel(id: string, ownedBy: string) {
  return { id, ownedBy, createAt: new Date().getTime() }
}

export async function addCustomModel(model: IModel) {
  if (modelIsExist(model.id)) {
    throw new Error(`模型 ${model.id} 已存在`)
  }
  await db.customModels.add(model)
}

export async function getCustomModelsByOwnedBy(ownedBy: string) {
  return await db.customModels.where('ownedBy').equals(ownedBy).toArray()
}

export async function deleteCustomModel(id: string) {
  await db.customModels.delete(id)
}
