import type { ConversationsId, IMessage } from '@/db/interface'
import { Role } from '@/constants'
import { createMessage } from '@/store/conversation'
import { describe, expect, it } from 'vitest'
import GeminiService from '../google'

describe('gemini Service 测试', () => {
  it('当未提供 API Key 时，验证器应该抛出错误', () => {
    const service = new GeminiService()
    expect(() => service.validator()).toThrow('apiKey is required')
  })

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
    const messages: IMessage[] = [createMessage({ convId: '1' as ConversationsId, role: Role.USER, content: [
      { type: 'text', text: 'Hello, how are you?' },
      { type: 'image_url', image_url: { uid: '123', name: 'test.png', size: 100, type: 'image/png', url: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABgI' } },
    ] })]
    const service = new GeminiService()
    const result = service.transformMessages(messages)

    expect(result).toEqual({
      contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }, { inlineData: { mimeType: 'image/png', data: 'iVBORw0KGgoAAAANSUhEUgAABgI' } }] }],
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
      contents: [{ role: 'user', parts: [{ text: '' }] }],
    })
  })
})
