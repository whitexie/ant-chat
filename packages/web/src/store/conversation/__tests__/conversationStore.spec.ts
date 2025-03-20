import type { IConversationsSettings, ModelConfigId } from '@/db/interface'
import { ANT_CHAT_STRUCTURE, Role } from '@/constants'
import { getConversationsById, getMessagesByConvId } from '@/db'
import { setActiveConversationsId, useMessagesStore } from '@/store/messages'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import {
  addConversationsAction,
  clearConversationsAction,
  deleteConversationsAction,
  importConversationsAction,
  renameConversationsAction,
  updateConversationsSettingsAction,
} from '../actions'
import { createConversations, useConversationsStore } from '../conversationsStore'

describe('conversationStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useConversationsStore())
    result.current.reset()
  })

  it('add conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversations()

    await act(async () => {
      await addConversationsAction(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations).toEqual([conversation])
  })

  it('rename conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversations()

    await act(async () => {
      await addConversationsAction(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations).toEqual([conversation])

    await act(async () => {
      await renameConversationsAction(conversation.id, 'new name')
    })

    expect(result.current.conversations[0].title).toEqual('new name')
  })

  it('delete conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversations()

    await act(async () => {
      await addConversationsAction(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)

    await act(async () => {
      await deleteConversationsAction(conversation.id)
    })

    expect(result.current.conversations).toHaveLength(0)
  })

  it('import conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversations({ updateAt: 1 })
    const conversation2 = createConversations({ updateAt: 2 })
    const importData = Object.assign({}, ANT_CHAT_STRUCTURE, { conversations: [conversation, conversation2] })

    await act(async () => {
      await importConversationsAction(importData)
    })

    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.conversations).toEqual([conversation, conversation2])
  })

  it('clear conversations', async () => {
    const { result } = renderHook(() => useConversationsStore())
    const { result: messagesResult } = renderHook(() => useMessagesStore())

    const conversation = createConversations()

    await act(async () => {
      await addConversationsAction(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)

    await act(async () => {
      await clearConversationsAction()
    })

    expect(result.current.conversations).toHaveLength(0)
    expect(messagesResult.current.activeConversationsId).toEqual('')
  })

  it('upate conversations settings', async () => {
    const conversations = createConversations()

    await addConversationsAction(conversations)

    await setActiveConversationsId(conversations.id)

    const newModelConfig: IConversationsSettings = {
      modelConfig: {
        id: 'DeepSeek' as ModelConfigId,
        apiHost: 'https://api.deepseek.com',
        apiKey: '12306',
        model: 'deepseek-chat',
        temperature: 0,
      },
      systemPrompt: '你是一个乐于助人的AI助理',
    }

    await updateConversationsSettingsAction(conversations.id, newModelConfig as IConversationsSettings)

    const result = await getConversationsById(conversations.id)

    expect(result?.settings).toBeDefined()
    expect(result?.settings).toEqual(newModelConfig)

    const messages = await getMessagesByConvId(conversations.id)
    const content = messages.find(message => message.role === Role.SYSTEM)?.content

    expect(content).toBe(newModelConfig.systemPrompt)
  })
})
