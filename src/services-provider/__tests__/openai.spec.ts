import type { ConversationsId } from '@/db/interface'

import { createMessage } from '@/store/conversation'
import { describe, expect, it } from 'vitest'
import OpenAIService from '../openai'
import { createMockStream } from './util'

describe('openAI service', () => {
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

  describe('parseSse', () => {
    it('parseSse', async () => {
      // 创建模拟的 ReadableStream
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
