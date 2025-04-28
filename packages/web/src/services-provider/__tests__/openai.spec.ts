/* eslint-disable perfectionist/sort-imports */
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockResponse, createMockStream } from './util'
import request from '@/utils/request'

import type { ConversationsId, IMcpToolCall, IMessageContent } from '@/db/interface'
import OpenAIService from '../openai'
import { createUserMessage } from '@/db/dataFactory'

vi.mock('@/utils/request')

describe('openAI service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('transformMessages', () => {
    it('messages 包含图片', () => {
      const messages = [
        createUserMessage({ convId: '0' as ConversationsId, content: 'test1' }),
        createUserMessage({ convId: '0' as ConversationsId, content: 'test2', images: [{ uid: '0', name: 'test', type: 'image/png', size: 123, data: 'https://example.com/image.jpg' }] }),
      ]

      const result = new OpenAIService().transformMessages(messages)
      expect(result).toEqual([
        { role: 'user', content: [{ type: 'text', text: 'test1' }] },
        { role: 'user', content: [{ type: 'text', text: 'test2' }, { type: 'image_url', image_url: { url: 'https://example.com/image.jpg' } }] },
      ])
    })

    it('messages 都是text数组', () => {
      const messages = [
        createUserMessage({ convId: '0' as ConversationsId, content: 'test1' }),
        createUserMessage({ convId: '0' as ConversationsId, content: 'test2' }),
      ]

      const result = new OpenAIService().transformMessages(messages)
      expect(result).toEqual([
        { role: 'user', content: 'test1' },
        { role: 'user', content: 'test2' },
      ])
    })

    it('content都是字符串', () => {
      const messages = [
        createUserMessage({ convId: '0' as ConversationsId, content: 'test1' }),
        createUserMessage({ convId: '0' as ConversationsId, content: 'test2' }),
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
      await service.sendChatCompletions([createUserMessage({ convId: '0' as ConversationsId, content: 'test1' })])

      expect(mockRequest).toMatchSnapshot()
    })

    describe('异常处理', () => {
      it('错误的apiKey', async () => {
        vi.mocked(request).mockResolvedValue(
          createMockResponse({
            error: { message: 'Authentication Fails (no such user)' },
          }, { status: 401, statusText: 'Unauthorized', headers: { 'Content-Type': 'application/json' } }),
        )
        const service = new OpenAIService({ apiHost: 'https://api.deepseek.com/v1', apiKey: 'test', model: 'gpt-4o' })

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
      let result: IMessageContent = ''
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

    it('parse function call', async () => {
      // 创建模拟的 ReadableStream·
      const stream = createMockStream([
        'data: {"id":"1","object":"chat.completion.chunk","created":1745388868,"model":"deepseek-chat","system_fingerprint":"2","choices":[{"index":0,"delta":{"role":"assistant","content":"好的，接下来..."},"logprobs":null,"finish_reason":null}]}',
        'data: {"id":"1","object":"chat.completion.chunk","created":1745388868,"model":"deepseek-chat","system_fingerprint":"2","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"id":"call_0_1e905eb5-a324-49da-bb77-91321ac0dfdd","type":"function","function":{"name":"playwright___browser_navigate","arguments":""}}]},"logprobs":null,"finish_reason":null}]}',
        'data: {"id":"1","object":"chat.completion.chunk","created":1745388868,"model":"deepseek-chat","system_fingerprint":"2","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"{\\\"url\\\":\\\""}}]},"logprobs":null,"finish_reason":null}]}',
        'data: {"id":"1","object":"chat.completion.chunk","created":1745388868,"model":"deepseek-chat","system_fingerprint":"2","choices":[{"index":0,"delta":{"tool_calls":[{"index":0,"function":{"arguments":"https://mp.weixin.qq.com/s/W7Zt-pjTZaguIyNI0rbN7A\\\"}"}}]},"logprobs":null,"finish_reason":null}]}',
        'data: [DONE]',
      ])

      const service = new OpenAIService({ enableMCP: true })
      let result: IMessageContent = ''
      const functionCallList: IMcpToolCall[] = []
      await service.parseSse(stream.getReader(), {
        onUpdate: (data) => {
          result = data.message
        },
        onSuccess: (data) => {
          const { functioncalls = [] } = data
          functionCallList.push(...functioncalls)
        },
      })

      expect(result).toBe('好的，接下来...')
      expect(functionCallList).toHaveLength(1)
    })
  })
})
