import { mockDb } from './utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeTestDb } from '../../db'
import { addProviderService, updateProviderService } from '../providerServices'

describe('providerServices', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    await initializeTestDb()
    await mockDb()
  })

  it('应该能够添加一个提供商服务', () => {
    const data: any = {
      id: '1',
      name: 'test',
      baseUrl: 'https://test.com',
      apiKey: 'test',
      apiMode: 'openai',
      isOfficial: true,
    }

    const providerService = addProviderService(data)

    expect(providerService).toEqual({
      ...data,
      createdAt: expect.any(Number),
      isOfficial: false,
      isEnabled: false,
      updatedAt: expect.any(Number),
    })
  })

  describe('updateProviderService', () => {
    it('能够正确更新isEnabled字段', () => {
      let data: any = {
        name: 'test2',
        baseUrl: 'https://test2.com',
        apiKey: 'test2',
        apiMode: 'openai',
      }
  
      data = addProviderService(data)
  
      expect(data.isEnabled).toBeFalsy()
  
      data = updateProviderService({
        id: data.id,
        isEnabled: true,
      })
      expect(data.isEnabled).toBeTruthy()
    })

    it('能够正确的更新baseUrl字段', async () => {
      let data: any = {
        name: 'test2',
        baseUrl: 'https://test2.com',
        apiKey: 'test2',
        apiMode: 'openai',
      }
  
      data = addProviderService(data)
      const newUrl = 'https://test3.com'
      data = updateProviderService({
        id: data.id,
        baseUrl: newUrl,
      })

      expect(data.baseUrl).toBe(newUrl)
    })

    it('能够正确的更新apiKey字段', async () => {
      let data: any = {
        name: 'test2',
        baseUrl: 'https://test2.com',
        apiKey: 'test2',
        apiMode: 'openai',
      }

      data = addProviderService(data)
      const newKey = 'test3'
      data = updateProviderService({
        id: data.id,
        apiKey: newKey,
      })

      expect(data.apiKey).toBe(newKey)
    })
  })
})
