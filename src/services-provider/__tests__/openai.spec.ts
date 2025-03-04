/* eslint-disable perfectionist/sort-imports */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockResponse, createMockStream } from './util'
import request from '@/utils/request'

import type { ConversationsId } from '@/db/interface'
import { createMessage } from '@/store/conversation'
import OpenAIService from '../openai'

vi.mock('@/utils/request')

describe('openAI service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('transformMessages', () => {
    it('messages 包含图片', () => {
      const messages = [
        createMessage({ convId: '0' as ConversationsId, content: 'test1' }),
        createMessage({ convId: '0' as ConversationsId, content: 'test2', images: [{ uid: '0', name: 'test', type: 'image/png', size: 123, data: 'https://example.com/image.jpg' }] }),
      ]

      const result = new OpenAIService().transformMessages(messages)
      expect(result).toEqual([
        { role: 'user', content: [{ type: 'text', text: 'test1' }] },
        { role: 'user', content: [{ type: 'text', text: 'test2' }, { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }] },
      ])
    })

    it('messages 都是text数组', () => {
      const messages = [
        createMessage({ convId: '0' as ConversationsId, content: 'test1' }),
        createMessage({ convId: '0' as ConversationsId, content: 'test2' }),
      ]

      const result = new OpenAIService().transformMessages(messages)
      expect(result).toEqual([
        { role: 'user', content: 'test1' },
        { role: 'user', content: 'test2' },
      ])
    })

    it('content都是字符串', () => {
      const messages = [
        createMessage({ convId: '0' as ConversationsId, content: 'test1' }),
        createMessage({ convId: '0' as ConversationsId, content: 'test2' }),
      ]

      const result = new OpenAIService().transformMessages(messages)
      expect(result).toEqual([
        { role: 'user', content: 'test1' },
        { role: 'user', content: 'test2' },
      ])
    })
  })

  describe('sendChatCompletions', async () => {
    it('验证request接受到正确的请求参数', async () => {
      const mockRequest = vi.mocked(request).mockImplementation(vi.fn(async () => createMockResponse({})))
      const service = new OpenAIService({ apiHost: 'https://api.deepseek.com/v1', apiKey: 'test' })

      service.setModel('test-model')
      service.setTemperature(0.5)
      await service.sendChatCompletions([createMessage({ convId: '0' as ConversationsId, content: 'test1' })])

      expect(mockRequest).toHaveBeenCalledWith('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'Authorization': `Bearer ${'test'}`,
        },
        body: JSON.stringify({ messages: [{ role: 'user', content: 'test1' }], model: 'test-model', stream: true, temperature: 0.5,
        }),
      })
    })

    describe('异常处理', () => {
      it('错误的apiKey', async () => {
        vi.mocked(request).mockResolvedValue(
          createMockResponse({
            error: { message: 'Authentication Fails (no such user)' },
          }, { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } }),
        )
        const service = new OpenAIService({ apiHost: 'https://api.deepseek.com/v1', apiKey: 'test' })

        await expect(service.sendChatCompletions([])).rejects.toThrowError(new Error('401 Authentication Fails (no such user)'))
      })
    })
  })

  describe('parseSse', () => {
    it('parseSse', async () => {
      // 创建模拟的 ReadableStream·
      const stream = createMockStream([
        // 这里的数据是简化过的，实际数据会包含很多字段
        'data: {"choices":[{"delta":{"content":"","reasoning_content":"这是思考过程...","role":"assistant"},"index":0}]}',
        'data: {"choices":[{"delta":{"content":"简介","role":"assistant"},"index":0}]}',
        'data: [DONE]',
      ])

      const service = new OpenAIService()
      let result = ''
      let reasoningContent = ''
      await service.parseSse(stream.getReader(), {
        onUpdate: (data) => {
          result = data.message
          reasoningContent = data.reasoningContent
        },
      })
      expect(result).toEqual('简介')
      expect(reasoningContent).toEqual('这是思考过程...')
    })
  })
})
