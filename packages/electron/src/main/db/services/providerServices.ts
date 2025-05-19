import type { UpdateProviderServiceSchema } from '@ant-chat/shared'
import { AddProviderServiceSchema } from '@ant-chat/shared'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { providerServicesTable } from '../schema'

export function getAllProviderServices() {
  return db.select().from(providerServicesTable).all()
}

export function updateProviderService(config: UpdateProviderServiceSchema) {
  return db.update(providerServicesTable)
    .set({ ...config, updatedAt: Date.now() })
    .where(eq(providerServicesTable.id, config.id))
    .returning()
    .get({ id: config.id })
}

export function addProviderService(config: AddProviderServiceSchema) {
  const data = AddProviderServiceSchema.parse(config)
  return db.insert(providerServicesTable).values(data).returning().get()
}

export async function deleteProviderService(id: string) {
  return await db.delete(providerServicesTable)
    .where(and(
      eq(providerServicesTable.id, id),
      eq(providerServicesTable.isOfficial, false),
    ))
}

export function getProviderServiceById(id: string) {
  return db.select().from(providerServicesTable).where(eq(providerServicesTable.id, id)).get()
}
