import type { ServiceProviderSchema, UpdateServiceProviderSchema } from '@ant-chat/shared'
import { AddServiceProviderSchema } from '@ant-chat/shared'
import { and, eq } from 'drizzle-orm'
import { db } from '../db'
import { serviceProviderTable } from '../schema'

export function getAllProviderServices(): ServiceProviderSchema[] {
  return db.select().from(serviceProviderTable).all()
}

export function updateProviderService(config: UpdateServiceProviderSchema) {
  return db.update(serviceProviderTable)
    .set({ ...config, updatedAt: Math.floor(Date.now() / 1000) })
    .where(eq(serviceProviderTable.id, config.id))
    .returning()
    .get({ id: config.id })
}

export function addProviderService(config: AddServiceProviderSchema) {
  const data = AddServiceProviderSchema.parse(config)
  return db.insert(serviceProviderTable).values(data).returning().get()
}

export async function deleteProviderService(id: string) {
  return await db.delete(serviceProviderTable)
    .where(and(
      eq(serviceProviderTable.id, id),
      eq(serviceProviderTable.isOfficial, false),
    ))
}

export function getProviderServiceById(id: string) {
  return db.select().from(serviceProviderTable).where(eq(serviceProviderTable.id, id)).get()
}
