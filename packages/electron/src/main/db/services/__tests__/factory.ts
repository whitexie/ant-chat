import { nanoid } from 'nanoid'
import { db } from '../../db'
import { providerServiceModelsTable, providerServicesTable } from '../../schema'

// 插入 providerServices 测试数据
export async function createProviderService(data: Partial<typeof providerServicesTable.$inferInsert> = {}): Promise<any> {
  const defaultData = {
    id: `provider-${nanoid()}`,
    name: 'Test Service',
    baseUrl: 'http://localhost',
    apiMode: 'test',
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
    model: 'Test Model',
    isBuiltin: false,
    isEnabled: true,
    modelFeatures: null,
    providerServiceId: data.providerServiceId || `provider-1`, // 需传入真实 providerServiceId
    createdAt: Math.floor(Date.now() / 1000),
  }
  const insertData = { ...defaultData, ...data }
  const [row] = await db.insert(providerServiceModelsTable).values(insertData).returning()
  return row
}
