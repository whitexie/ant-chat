import type { AllAvailableModelsSchema, ProviderServiceModelsSchema } from '@ant-chat/shared'
import { desc, eq } from 'drizzle-orm'
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
          model: true,
          modelFeatures: true,
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
