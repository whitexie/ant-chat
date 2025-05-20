import type { ProviderServiceModelsSchema } from '@ant-chat/shared'
import { desc, eq, getTableColumns } from 'drizzle-orm'
import { db } from '../db'
import { providerServiceModelsTable, providerServicesTable } from '../schema'

export async function getAllAvailableModels(): Promise<ProviderServiceModelsSchema[]> {
  const models = await db.select({
    ...getTableColumns(providerServiceModelsTable),
  })
    .from(providerServiceModelsTable)
    .leftJoin(providerServicesTable, eq(providerServiceModelsTable.providerServiceId, providerServicesTable.id))
    .where(eq(providerServicesTable.isEnabled, true))

  return models
}

export async function getAllModelsByProviderServiceId(providerServiceId: string): Promise<ProviderServiceModelsSchema[]> {
  const models = await db.select()
    .from(providerServiceModelsTable)
    .where(eq(providerServiceModelsTable.providerServiceId, providerServiceId))
    .orderBy(desc(providerServiceModelsTable.createdAt))

  return models
}
