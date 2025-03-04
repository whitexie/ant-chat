import type { ConversationsId, IMessage } from '@/db/interface'
import { Role } from '@/constants'
import { createMessage } from '@/store/conversation'
import request from '@/utils/request'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import GeminiService from '../google'
import { createMockResponse, createMockStream } from './util'

vi.mock('@/utils/request')

describe('gemini Service 测试', () => {
  describe('transformMessages', () => {
    it('应该正确转换用户消息为 Gemini 请求格式', () => {
      const messages: IMessage[] = [createMessage({ convId: '1' as ConversationsId, role: Role.USER, content: 'Hello, how are you?' })]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }] }],
      })
    })

    it('应该正确转换AI和用户的对话消息', () => {
      const messages: IMessage[] = [
        createMessage({ convId: '1' as ConversationsId, role: Role.USER, content: 'Hello' }),
        createMessage({ convId: '1' as ConversationsId, role: Role.AI, content: 'Hi there!' }),
        createMessage({ convId: '1' as ConversationsId, role: Role.SYSTEM, content: 'How are you?' }),
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
        createMessage({ convId: '1' as ConversationsId, role: Role.USER, content: 'Hello, how are you?', images: [{ uid: '123', name: 'test.png', size: 100, type: 'image/png', data: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABgI' }] }),
      ]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }, { inline_data: { mimeType: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAABgI' } }] }],
      })
    })

    it('应该正确转换系统消息', () => {
      const messages: IMessage[] = [createMessage({ convId: '1' as ConversationsId, role: Role.SYSTEM, content: 'You are a helpful assistant' })]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [],
        system_instruction: { parts: [{ text: 'You are a helpful assistant' }] },
      })
    })

    // 测试空消息处理
    it('当消息内容为空时应该正确处理', () => {
      const messages: IMessage[] = [createMessage({ convId: '1' as ConversationsId, role: Role.USER, content: '' })]
      const service = new GeminiService()
      const result = service.transformMessages(messages)

      expect(result).toEqual({
        contents: [{ role: 'user', parts: [] }],
      })
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
    it('正确解析响应数据', async () => {
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
          text = result.message
        },
        onSuccess: fn,
      })

      expect(text).toBe('Gemini是一个大模型')
      expect(fn).toHaveBeenCalled()
    })
  })
})
