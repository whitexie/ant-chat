import { nanoid } from 'nanoid'
import { db } from '../../db'
import { providerServiceModelsTable, providerServicesTable } from '../../schema'

// 插入 providerServices 测试数据
export async function createProviderService(data: Partial<typeof providerServicesTable.$inferInsert> = {}): Promise<any> {
  const defaultData = {
    id: `provider-${nanoid()}`,
    name: 'Test Service',
    baseUrl: 'http://localhost',
    apiMode: 'openai' as const,
    isOfficial: false,
    isEnabled: true,
    createdAt: Math.floor(Date.now() / 1000),
    updatedAt: Math.floor(Date.now() / 1000),
  }
  const insertData = { ...defaultData, ...data }
  const [row] = await db.insert(providerServicesTable).values(insertData).returning()
  return row
}

// 插入 providerServiceModels 测试数据
export async function createProviderServiceModel(data: Partial<typeof providerServiceModelsTable.$inferInsert> = {}): Promise<any> {
  const defaultData = {
    id: nanoid(),
    name: 'Test Model',
    model: 'test-model',
    isBuiltin: false,
    isEnabled: true,
    modelFeatures: null,
    providerServiceId: data.providerServiceId || `provider-${nanoid()}`,
    createdAt: Math.floor(Date.now() / 1000),
  }
  const insertData = { ...defaultData, ...data }
  const [row] = await db.insert(providerServiceModelsTable).values(insertData).returning()
  return row
}
