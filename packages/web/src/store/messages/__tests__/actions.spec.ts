import type { IMessage, MessageId } from '@/db/interface'
import { Role } from '@/constants'
import { addConversationsAction, createConversations, createMessage, useConversationsStore } from '@/store/conversation'
import { renderHook } from '@testing-library/react'
import { act } from 'react'
import { beforeEach, describe, expect, it } from 'vitest'
import { addMessageAction, deleteMessageAction, setActiveConversationsId, updateMessageAction } from '../actions'
import { useMessagesStore } from '../store'

describe('messages actions', () => {
  beforeEach(() => {
    const { result: conversationsResult } = renderHook(() => useConversationsStore())
    conversationsResult.current.reset()

    const { result: messagesResult } = renderHook(() => useMessagesStore())
    messagesResult.current.reset()
  })

  it('add text message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    const conversation = createConversations()
    const message: IMessage = createMessage({
      id: '1' as MessageId,
      role: Role.USER,
      content: 'test',
      createAt: 1,
      convId: conversation.id,
    })

    await act(async () => {
      await addConversationsAction(conversation)
      await setActiveConversationsId(conversation.id)
    })

    await act(async () => {
      await addMessageAction(message)
    })

    // 下标0是系统提示词
    expect(result.current.messages[1]).toEqual(message)
  })

  it('add image message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    const conversation = createConversations()

    const message: IMessage = createMessage({
      content: 'text',
      images: [{ uid: '1', name: 'test', data: 'https://example.com/image.jpg', size: 100, type: 'image/jpeg' }],
      convId: conversation.id,
    })

    await act(async () => {
      await addConversationsAction(conversation)
      await setActiveConversationsId(conversation.id)
    })

    await act(async () => {
      await addMessageAction(message)
    })

    // 下标0是系统提示词
    expect(result.current.messages[1]).toEqual(message)
  })

  it('update message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    const conversation = createConversations()
    const message = createMessage({ convId: conversation.id, role: Role.USER, content: 'test', createAt: 1 })

    const newMessage = { ...message, content: 'new content' }

    await act(async () => {
      await addConversationsAction(conversation)
      await setActiveConversationsId(conversation.id)
      await addMessageAction(message)
    })

    await act(async () => {
      await updateMessageAction(newMessage)
    })

    // 下标0是系统提示词
    expect(result.current.messages[1]).toEqual(newMessage)
  })

  it('delete message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    const conversation = createConversations()
    const message = createMessage({ convId: conversation.id, role: Role.USER, content: 'test', createAt: 1 })

    await act(async () => {
      await addConversationsAction(conversation)
      await setActiveConversationsId(conversation.id)
      await addMessageAction(message)
    })

    expect(result.current.messages).toHaveLength(2)
    // 下标0是系统提示词
    expect(result.current.messages[1]).toEqual(message)

    await act(async () => {
      await deleteMessageAction(message.id)
    })

    expect(result.current.messages).toHaveLength(1)
  })
})
