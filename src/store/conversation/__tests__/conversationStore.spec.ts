import { Role } from '@/constants'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createConversation, useConversationsStore } from '../conversationsStore'

describe('conversationStore', () => {
  beforeEach(async () => {
    const { result } = renderHook(() => useConversationsStore())
    await result.current.reset()
  })

  it('should be a function', () => {
    const { result } = renderHook(() => useConversationsStore())

    expect(result.current.conversations).toEqual([])
  })

  it('add conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    await act(async () => {
      await result.current.addConversation(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations).toEqual([conversation])
  })

  it('rename conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    await act(async () => {
      await result.current.addConversation(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations).toEqual([conversation])

    await act(async () => {
      await result.current.renameConversation(conversation.id, 'new name')
    })

    expect(result.current.conversations[0].title).toEqual('new name')
  })

  it('delete conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    await act(async () => {
      await result.current.addConversation(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)

    await act(async () => {
      await result.current.deleteConversation(conversation.id)
    })

    expect(result.current.conversations).toHaveLength(0)
  })

  it('import conversation', () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()
    const conversation2 = createConversation()

    act(() => {
      result.current.importConversations([conversation, conversation2])
    })

    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.conversations).toEqual([conversation, conversation2])
  })

  it('clear conversations', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    await act(async () => {
      await result.current.addConversation(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)

    await act(async () => {
      await result.current.clearConversations()
    })

    expect(result.current.conversations).toHaveLength(0)
    expect(result.current.activeConversationId).toEqual('')
  })

  it('add text message', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()
    const message: ChatMessage = {
      id: '1',
      role: Role.USER,
      content: 'test',
      createAt: 1,
      convId: conversation.id,
    }

    await act(async () => {
      await result.current.addConversation(conversation)
    })

    await act(async () => {
      await result.current.addMessage(message)
    })

    expect(result.current.messages).toEqual([message])
  })

  it('add image message', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    const message: ChatMessage = {
      id: '1',
      role: Role.USER,
      content: [
        { type: 'image_url', image_url: { uid: '1', name: 'test', url: 'https://example.com/image.jpg', size: 100, type: 'image/jpeg' } },
        { type: 'text', text: 'test' },
      ],
      convId: conversation.id,
      createAt: 1,
    }

    await act(async () => {
      await result.current.addConversation(conversation)
    })

    await act(async () => {
      await result.current.addMessage(message)
    })

    expect(result.current.messages).toEqual([message])
  })
})
