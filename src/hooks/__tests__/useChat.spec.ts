import type { ChatMessage } from '../useChat'
import { sendChatMessage } from '@/api'
import { Role } from '@/constants'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useChat } from '../useChat'

// Mock XStream implementation
const mockXStream = vi.fn()

// Mock dependencies
vi.mock('@/api', () => ({
  sendChatMessage: vi.fn(),
}))

vi.mock('@ant-design/x', () => ({
  useXChat: vi.fn().mockReturnValue({
    messages: [],
    setMessages: vi.fn(),
    parsedMessages: [],
    onRequest: vi.fn(),
  }),
  XStream: ({ readableStream }: { readableStream: ReadableStream }) => {
    return mockXStream(readableStream)
  },
}))

describe('useChat', () => {
  const createTestMessage = (content: string): ChatMessage => ({
    id: '1',
    role: Role.USER,
    content,
    createAt: Date.now(),
  })

  beforeEach(() => {
    vi.clearAllMocks()

    // 设置默认的 mock 返回值，创建完整的 Response 对象
    vi.mocked(sendChatMessage).mockResolvedValue({
      response: new Response(new ReadableStream(), {
        status: 200,
        statusText: 'OK',
        headers: new Headers({
          'Content-Type': 'text/event-stream',
        }),
      }),
    })
  })

  // 测试基本初始化
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useChat())

    expect(result.current.messages).toEqual([])
    expect(result.current.agent).toBeDefined()
    expect(typeof result.current.onRequest).toBe('function')
  })

  // 测试成功的消息流处理
  it('should handle successful message stream', async () => {
    const chunks = [
      { data: JSON.stringify({ choices: [{ delta: { content: 'Hello' } }] }) },
      { data: JSON.stringify({ choices: [{ delta: { content: ' World' } }] }) },
      { data: '[DONE]' },
    ]

    mockXStream.mockReturnValue(chunks)

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useChat({ onSuccess }))

    await act(async () => {
      await result.current.agent.request(
        {
          message: { id: '1', role: Role.USER, content: 'Hi', createAt: Date.now() },
          messages: [{ id: '1', role: Role.USER, content: 'Hi', createAt: Date.now() }],
        },
        {
          onUpdate: vi.fn(),
          onSuccess,
          onError: vi.fn(),
        },
      )
    })

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        role: Role.AI,
        content: 'Hello World',
      }),
    )
  })

  // 测试空消息处理
  it('should handle empty message info', async () => {
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.agent.request(
        { message: undefined, messages: undefined },
        {
          onUpdate: vi.fn(),
          onSuccess: vi.fn(),
          onError: vi.fn(),
        },
      )
    })

    expect(sendChatMessage).not.toHaveBeenCalled()
  })

  // 测试错误的JSON响应
  it('should handle invalid JSON in stream', async () => {
    const chunks = [
      { data: 'invalid json' },
    ]

    mockXStream.mockReturnValue(chunks)
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const onError = vi.fn()

    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.agent.request(
        {
          message: { id: '1', role: Role.USER, content: 'Hi', createAt: Date.now() },
          messages: [{ id: '1', role: Role.USER, content: 'Hi', createAt: Date.now() }],
        },
        {
          onUpdate: vi.fn(),
          onSuccess: vi.fn(),
          onError,
        },
      )
    })

    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
  })

  // 测试网络错误处理
  it('should handle network error', async () => {
    const networkError = new Error('Network error')
    vi.mocked(sendChatMessage).mockImplementation(async () => {
      throw networkError
    })

    const onError = vi.fn()
    const { result } = renderHook(() => useChat())

    await result.current.agent.request(
      {
        message: createTestMessage('Hi'),
        messages: [createTestMessage('Hi')],
      },
      {
        onUpdate: vi.fn(),
        onSuccess: vi.fn(),
        onError,
      },
    )

    // 验证 onError 回调被调用
    expect(onError).toHaveBeenCalledWith(networkError)
  })

  // 测试消息更新回调
  it('should call onUpdate for each content chunk', async () => {
    const chunks = [
      { data: JSON.stringify({ choices: [{ delta: { content: 'Hello' } }] }) },
      { data: JSON.stringify({ choices: [{ delta: { content: ' World' } }] }) },
    ]

    mockXStream.mockReturnValue(chunks)

    const onUpdate = vi.fn()
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.agent.request(
        {
          message: createTestMessage('Hi'),
          messages: [createTestMessage('Hi')],
        },
        {
          onUpdate,
          onSuccess: vi.fn(),
          onError: vi.fn(),
        },
      )
    })

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onUpdate).toHaveBeenCalledTimes(2)
    expect(onUpdate).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: 'Hello',
      }),
    )
    expect(onUpdate).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        content: 'Hello World',
      }),
    )
  })

  // 测试空数据块处理
  it('should handle empty data chunks', async () => {
    const chunks = [
      { data: '' },
      { data: JSON.stringify({ choices: [{ delta: { content: 'Hello' } }] }) },
    ]

    mockXStream.mockReturnValue(chunks)

    const onUpdate = vi.fn()
    const { result } = renderHook(() => useChat())

    await act(async () => {
      await result.current.agent.request(
        {
          message: { id: '1', role: Role.USER, content: 'Hi', createAt: Date.now() },
          messages: [{ id: '1', role: Role.USER, content: 'Hi', createAt: Date.now() }],
        },
        {
          onUpdate,
          onSuccess: vi.fn(),
          onError: vi.fn(),
        },
      )
    })

    // 等待异步操作完成
    await new Promise(resolve => setTimeout(resolve, 0))

    expect(onUpdate).toHaveBeenCalledTimes(1)
  })
})
