import type { ConversationsId, IMessage, IMessageContent } from '@/db/interface'
import { Role } from '@/constants'
import { createAIMessage, createSystemMessage, createUserMessage } from '@/db/dataFactory'
import request from '@/utils/request'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GeminiService from '../google'
import { createMockResponse, createMockStream } from './util'

vi.mock('@/utils/request')

describe('gemini Service 测试', () => {
  describe('transformMessages', () => {
    it('应该正确转换用户消息为 Gemini 请求格式', () => {
      const messages: IMessage[] = [createUserMessage({ convId: '1' as ConversationsId, role: Role.USER, content: 'Hello, how are you?' })]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }] }],
      })
    })

    it('应该正确转换AI和用户的对话消息', () => {
      const messages: IMessage[] = [
        createUserMessage({ convId: '1' as ConversationsId, role: Role.USER, content: 'Hello' }),
        createAIMessage({ convId: '1' as ConversationsId, role: Role.AI, content: 'Hi there!' }),
        createSystemMessage({ convId: '1' as ConversationsId, role: Role.SYSTEM, content: 'How are you?' }),
      ]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [
          { role: 'user', parts: [{ text: 'Hello' }] },
          { role: 'model', parts: [{ text: 'Hi there!' }] },
        ],
        system_instruction: {
          parts: [
            { text: 'How are you?' },
          ],
        },
      })
    })

    it('应该正确转换包含图片的用户消息', () => {
      const messages: IMessage[] = [
        createUserMessage({ convId: '1' as ConversationsId, role: Role.USER, content: 'Hello, how are you?', images: [{ uid: '123', name: 'test.png', size: 100, type: 'image/png', data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABgI' }] }),
      ]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }, { inline_data: { mimeType: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAABgI' } }] }],
      })
    })

    it('应该正确转换系统消息', () => {
      const messages: IMessage[] = [createSystemMessage({ convId: '1' as ConversationsId, role: Role.SYSTEM, content: 'You are a helpful assistant' })]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [],
        system_instruction: { parts: [{ text: 'You are a helpful assistant' }] },
      })
    })

    // 测试空消息处理
    it('当消息内容为空时应该正确处理', () => {
      const messages: IMessage[] = [createUserMessage({ convId: '1' as ConversationsId, role: Role.USER, content: '' })]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [{ role: 'user', parts: [] }],
      })
    })

    it('应该正确转换消息 - 用例案例1', async () => {
      const messages: IMessage[] = [
        {
          id: '-jQfQfoOYtcMnQ2oaU2jK',
          convId: 'conv-i8iG4_zHwC2XCshb9QChX',
          role: Role.AI,
          content: [],
          createAt: 1746600769405,
          status: 'success',
          modelInfo: {
            model: 'gemini-2.5-pro-exp-03-25',
            provider: 'Google',
          },
          reasoningContent: '',
          mcpTool: [
            {
              id: 'functioncall-IwxcUTjc_mfGivfagpxB8',
              serverName: 'amap-mcp-sse',
              toolName: 'maps_geo',
              args: {
                city: '杭州',
                address: '西湖',
              },
              executeState: 'completed',
              result: {
                success: true,
                data: '{"results":[{"country":"中国","province":"浙江省","city":"杭州市","citycode":"0571","district":"西湖区","street":[],"number":[],"adcode":"330106","location":"120.130396,30.259242","level":"区县"}]}',
                error: '',
              },
            },
          ],
        },
      ]

      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result.contents).toHaveLength(2)
    })
  })

  describe('sendChatCompletions', () => {
    beforeEach(() => {
      vi.clearAllMocks()
    })

    it('开启联网功能', async () => {
      const mockRequest = vi.mocked(request).mockImplementation(vi.fn(async () => createMockResponse({})))
      const service = new GeminiService({ apiKey: 'test' })

      await service.sendChatCompletions([], { features: { onlineSearch: true } })

      const requestBody = JSON.parse(mockRequest.mock.calls[0][1].body as string)
      expect(requestBody.tools[0]).toHaveProperty('googleSearch', {})
    })

    describe('错误处理', () => {
      it('response 400', async () => {
        vi.mocked(request).mockResolvedValue(createMockResponse({ error: { message: 'Bad Request' } }, { status: 400, statusText: 'Bad Request' }))
        const service = new GeminiService({ apiKey: 'test' })

        await expect(service.sendChatCompletions([])).rejects.toThrowError('请求失败. Bad Request')
      })

      it('response 500', async () => {
        vi.mocked(request).mockResolvedValue(createMockResponse({ error: { message: 'Bad Request' } }, { status: 500, statusText: 'Bad Request' }))
        const service = new GeminiService({ apiKey: 'test' })

        await expect(service.sendChatCompletions([])).rejects.toThrowError('请求失败. Bad Request')
      })
    })
  })

  describe('parseSse', () => {
    it('正确解析响应数据 - 案例1', async () => {
      const steam = createMockStream([
        'data: {"candidates": [{"content": {"parts": [{"text": "Gem"}],"role": "model"},"index": 0}]}',
        'data: {"candidates": [{"content": {"parts": [{"text": "ini是一个大模型"}],"role": "model"},"index": 0}]}',
      ], '\r\n\r\n', '\r\n')
      const reader = steam.getReader()

      const fn = vi.fn()

      const service = new GeminiService()

      let text = ''

      await service.parseSse(reader, {
        onUpdate: (result) => {
          text = result.message as string
        },
        onSuccess: fn,
      })

      expect(text).toEqual([
        { type: 'text', text: 'Gem' },
        { type: 'text', text: 'ini是一个大模型' },
      ])
      expect(fn).toHaveBeenCalled()
    })

    it('正确解析响应数据 - 案例2', async () => {
      const steam = createMockStream([
        'data: {"candidates": [{"content": {"parts": [{"text": "Gem"},{"inlineData": {"mimeType": "image/png", "data": "11111"}}, {"text": "ini"}],"role": "model"},"index": 0}]}',
      ], '\r\n\r\n', '\r\n')

      const reader = steam.getReader()
      const service = new GeminiService()

      let text: IMessageContent = []

      await service.parseSse(reader, {
        onSuccess: (result) => {
          text = result.message
        },
      })

      expect(text).toEqual([
        {
          type: 'text',
          text: 'Gem',
        },
        {
          type: 'image',
          mimeType: 'image/png',
          data: '11111',
        },
        {
          type: 'text',
          text: 'ini',
        },
      ])
    })

    it('正确解析响应数据 - 案例3', async () => {
      const steam = createMockStream([
        'data: {"candidates": [{"content": {"parts": [{"text": "123Gem"}],"role": "model"},"index": 0}]}',
        'data: {"candidates": [{"content": {"parts": [{"inlineData": {"mimeType": "image/png", "data": "11111"}}],"role": "model"},"index": 0}]}',
        'data: {"candidates": [{"content": {"parts": [{"text": "ini456"}],"role": "model"},"index": 0}]}',
      ], '\r\n\r\n', '\r\n')

      const reader = steam.getReader()
      const service = new GeminiService()

      let text: IMessageContent = []

      await service.parseSse(reader, {
        onSuccess: (result) => {
          text = result.message
        },
      })

      expect(text).toEqual([
        {
          type: 'text',
          text: '123Gem',
        },
        {
          type: 'image',
          mimeType: 'image/png',
          data: '11111',
        },
        {
          type: 'text',
          text: 'ini456',
        },
      ])
    })
  })
})
