import type { IConversations, IMessage, MessageId } from '@ant-chat/shared'
import { Role } from '@/constants'
import { createConversations, createUserMessage } from '@/api/dataFactory'
import { addConversationsAction, useConversationsStore } from '@/store/conversation'
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

    let conversation: IConversations | null = null

    await act(async () => {
      conversation = await addConversationsAction(createConversations())
      await setActiveConversationsId(conversation.id)
    })

    let message: IMessage | null = null

    await act(async () => {
      message = await addMessageAction(createUserMessage({
        id: '1' as MessageId,
        role: Role.USER,
        content: [{ type: 'text', text: 'test' }],
        createdAt: 1,
        convId: conversation!.id,
      }))
    })

    expect(result.current.messages[0]).toEqual(message)
  })

  it('add image message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    let conversation: IConversations | null = null

    await act(async () => {
      conversation = await addConversationsAction(createConversations())
      await setActiveConversationsId(conversation.id)
    })

    let message: IMessage | null = null

    await act(async () => {
      message = await addMessageAction(createUserMessage({
        content: [{ type: 'text', text: 'test' }],
        images: [{ uid: '1', name: 'test', data: 'https://example.com/image.jpg', size: 100, type: 'image/jpeg' }],
        convId: conversation!.id,
      }))
    })

    expect(result.current.messages[0]).toEqual(message)
  })

  it('update message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    let conversation: IConversations | null = null

    await act(async () => {
      conversation = await addConversationsAction(createConversations())
      await setActiveConversationsId(conversation.id)
    })

    let newMessage: IMessage | null = null

    await act(async () => {
      const message = await addMessageAction(createUserMessage({
        convId: conversation!.id,
        role: Role.USER,
        content: [{ type: 'text', text: 'test' }],
        createdAt: 1,
      }))

      newMessage = await updateMessageAction({ ...message, content: [{ type: 'text', text: 'new content' }] })
    })

    expect(result.current.messages[0]).toEqual(newMessage)
  })

  it('delete message', async () => {
    const { result } = renderHook(() => useMessagesStore())

    let conversation: IConversations | null = null

    await act(async () => {
      conversation = await addConversationsAction(createConversations())
      await setActiveConversationsId(conversation.id)
    })

    let message: IMessage | null = null

    await act(async () => {
      message = await addMessageAction(createUserMessage({
        convId: conversation!.id,
        role: Role.USER,
        content: [{ type: 'text', text: 'test' }],
        createdAt: 1,
      }))
    })

    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0]).toEqual(message)

    await act(async () => {
      await deleteMessageAction(message!.id)
    })

    expect(result.current.messages).toHaveLength(0)
  })
})
