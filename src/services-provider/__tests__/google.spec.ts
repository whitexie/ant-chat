import { createMessage } from '@/store/conversation'
import { describe, expect, it } from 'vitest'
import GeminiService from '../google'

describe('gemini Service 测试', () => {
  it('当未提供 API Key 时，验证器应该抛出错误', () => {
    const service = new GeminiService()
    expect(() => service.validator()).toThrow('apiKey is required')
  })

  it('应该正确转换用户消息为 Gemini 请求格式', () => {
    const messages: ChatMessage[] = [createMessage({ convId: '1', role: 'user', content: 'Hello, how are you?' })]
    const service = new GeminiService()
    const result = service.transformMessages(messages)

    expect(result).toEqual({
      contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }] }],
      system_instruction: { parts: [] },
    })
  })

  it('应该正确转换AI和用户的对话消息', () => {
    const messages: ChatMessage[] = [
      createMessage({ convId: '1', role: 'user', content: 'Hello' }),
      createMessage({ convId: '1', role: 'assistant', content: 'Hi there!' }),
      createMessage({ convId: '1', role: 'user', content: 'How are you?' }),
    ]
    const service = new GeminiService()
    const result = service.transformMessages(messages)

    expect(result).toEqual({
      contents: [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Hi there!' }] },
        { role: 'user', parts: [{ text: 'How are you?' }] },
      ],
      system_instruction: { parts: [] },
    })
  })

  it('应该正确转换包含图片的用户消息', () => {
    const messages: ChatMessage[] = [createMessage({ convId: '1', role: 'user', content: [
      { type: 'text', text: 'Hello, how are you?' },
      { type: 'image_url', image_url: { uid: '123', name: 'test.png', size: 100, type: 'image/png', url: 'https://example.com/test.png' } },
    ] })]
    const service = new GeminiService()
    const result = service.transformMessages(messages)

    expect(result).toEqual({
      contents: [{ role: 'user', parts: [{ text: 'Hello, how are you?' }, { inlineData: { mimeType: 'image/png', data: 'https://example.com/test.png' } }] }],
      system_instruction: { parts: [] },
    })
  })

  it('应该正确转换系统消息', () => {
    const messages: ChatMessage[] = [createMessage({ convId: '1', role: 'system', content: 'You are a helpful assistant' })]
    const service = new GeminiService()
    const result = service.transformMessages(messages)

    expect(result).toEqual({
      contents: [],
      system_instruction: { parts: [{ text: 'You are a helpful assistant' }] },
    })
  })

  // 测试空消息处理
  it('当消息内容为空时应该正确处理', () => {
    const messages: ChatMessage[] = [createMessage({ convId: '1', role: 'user', content: '' })]
    const service = new GeminiService()
    const result = service.transformMessages(messages)

    expect(result).toEqual({
      contents: [{ role: 'user', parts: [{ text: '' }] }],
      system_instruction: { parts: [] },
    })
  })
})
