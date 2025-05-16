import type { IModel } from '@/services-provider/interface'
import { dbApi } from './dbApi'

async function modelIsExist(id: string, provider: string) {
  const response = await dbApi.getCustomModels(provider)
  if (!response.success || !response.data) {
    return false
  }
  return response.data.some((model: IModel) => model.id === id)
}

export function createCustomModel(id: string, ownedBy: string) {
  return { id, ownedBy, createAt: new Date().getTime() }
}

export async function addCustomModel(model: IModel) {
  if (await modelIsExist(model.id, model.ownedBy)) {
    throw new Error(`模型 ${model.id} 已存在`)
  }
  await dbApi.addCustomModel(model)
}

export async function getCustomModelsByOwnedBy(ownedBy: string) {
  const response = await dbApi.getCustomModels(ownedBy)
  if (!response.success || !response.data) {
    return []
  }
  return response.data.filter((model: IModel) => model.ownedBy === ownedBy)
}

export async function deleteCustomModel(id: string) {
  await dbApi.deleteCustomModel(id)
}
