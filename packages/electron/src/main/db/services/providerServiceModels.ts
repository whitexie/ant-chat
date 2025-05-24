import type { AllAvailableModelsSchema, ProviderServiceModelsSchema } from '@ant-chat/shared'
import { AddProviderServiceModelSchema } from '@ant-chat/shared'
import { and, desc, eq } from 'drizzle-orm'
import { db } from '../db'
import { providerServiceModelsTable, providerServicesTable } from '../schema'

export async function getAllAvailableModels(): Promise<AllAvailableModelsSchema[]> {
  const data = await db.query.providerServicesTable.findMany({
    columns: {
      id: true,
      name: true,
      baseUrl: true,
      apiKey: true,
      apiMode: true,
      isOfficial: true,
    },
    with: {
      models: {
        columns: {
          id: true,
          name: true,
          model: true,
          modelFeatures: true,
          providerServiceId: true,
        },
        where: eq(providerServiceModelsTable.isEnabled, true),
      },
    },
    where: eq(providerServicesTable.isEnabled, true),
  })

  return data as AllAvailableModelsSchema[]
}

export async function getModelsByProviderServiceId(providerServiceId: string): Promise<ProviderServiceModelsSchema[]> {
  const models = await db.select()
    .from(providerServiceModelsTable)
    .where(eq(providerServiceModelsTable.providerServiceId, providerServiceId))
    .orderBy(desc(providerServiceModelsTable.createdAt))

  return models
}

export async function setModelEnabledStatus(id: string, status: boolean) {
  return db.update(providerServiceModelsTable)
    .set({ isEnabled: status })
    .where(eq(providerServiceModelsTable.id, id))
    .returning()
    .get()
}

export async function addProviderServiceModel(config: AddProviderServiceModelSchema) {
  const data = AddProviderServiceModelSchema.parse(config)

  const count = await db.$count(providerServiceModelsTable, and(
    eq(providerServiceModelsTable.providerServiceId, data.providerServiceId),
    eq(providerServiceModelsTable.model, data.model),
  ))

  if (count >= 1) {
    throw new Error(`${data.model} 已存在，不可重复添加`)
  }

  return db.insert(providerServiceModelsTable)
    .values({ ...data, isEnabled: true })
    .returning()
    .get()
}

export async function deleteProviderServiceModel(id: string) {
  return db.delete(providerServiceModelsTable).where(eq(providerServiceModelsTable.id, id))
}
