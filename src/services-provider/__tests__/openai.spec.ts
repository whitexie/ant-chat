import type { ConversationsId } from '@/db/interface'
import { createMessage } from '@/store/conversation'
import { describe, expect, it } from 'vitest'
import OpenAIService from '../openai'

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
})
