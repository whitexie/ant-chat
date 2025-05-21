import { mockDb } from './utils'
import { beforeEach, describe, expect, it } from 'vitest'
import { getAllAvailableModels, getModelsByProviderServiceId } from '../providerServiceModels'
import { createProviderService, createProviderServiceModel } from './factory'

describe('providerServiceModels', () => {
  beforeEach(async () => {
    await mockDb()
  })

  describe('查询', () => {
    it('获取所有可用的模型', async () => {
      await createProviderService({ id: 'provider-service-id', isEnabled: true })
      await createProviderService({ id: 'provider-service-id-2', isEnabled: false })
      await createProviderServiceModel({ model: 'enabled-model', providerServiceId: 'provider-service-id' })
      await createProviderServiceModel({ model: 'enabled-model-2', providerServiceId: 'provider-service-id', isEnabled: false })
      await createProviderServiceModel({ providerServiceId: 'provider-service-id-2' })

      const models = await getAllAvailableModels()

      expect(models).toHaveLength(1)
      expect(models[0].id).toBe('provider-service-id')
      expect(models[0].models).toHaveLength(1)
      expect(models[0].models[0].model).toBe('enabled-model')
    })

    it('获取提供商下的所有模型', async () => {
      await createProviderService({ id: 'provider-service-id', isEnabled: false })

      await createProviderServiceModel({ id: 'provider-service-model-id-1', model: 'test-1', providerServiceId: 'provider-service-id', createdAt: 1 })
      await createProviderServiceModel({ id: 'provider-service-model-id-2', model: 'test-2', providerServiceId: 'provider-service-id', createdAt: 2 })

      const models = await getModelsByProviderServiceId('provider-service-id')

      expect(models).toHaveLength(2)
      expect(models[0].id).toBe('provider-service-model-id-2')
      expect(models[0].model).toBe('test-2')
      expect(models[0].providerServiceId).toBe('provider-service-id')
    })
  })
})
