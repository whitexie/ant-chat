import type { IConversationsSettings, IMessage, MessageId, ModelConfigId } from '@/db/interface'
import { ANT_CHAT_STRUCTURE, Role } from '@/constants'
import { getConversationsById, getMessagesByConvId } from '@/db'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { addConversationsAction, addMessageAction, clearConversationsAction, deleteConversationsAction, deleteMessageAction, importConversationsAction, renameConversationsAction, setActiveConversationsId, updateConversationsSettingsAction, updateMessageAction } from '../actions'
import { createConversation, createMessage, useConversationsStore } from '../conversationsStore'

describe('conversationStore', () => {
  beforeEach(async () => {
    const { result } = renderHook(() => useConversationsStore())
    await result.current.reset()
  })

  it('add conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    await act(async () => {
      await addConversationsAction(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)
    expect(result.current.conversations).toEqual([conversation])
  })

  it('rename conversation', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

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

    const conversation = createConversation()

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

    const conversation = createConversation()
    const conversation2 = createConversation()
    const importData = Object.assign({}, ANT_CHAT_STRUCTURE, { conversations: [conversation, conversation2] })

    await act(async () => {
      await importConversationsAction(importData)
    })

    expect(result.current.conversations).toHaveLength(2)
    expect(result.current.conversations).toEqual([conversation, conversation2])
  })

  it('clear conversations', async () => {
    const { result } = renderHook(() => useConversationsStore())

    const conversation = createConversation()

    await act(async () => {
      await addConversationsAction(conversation)
    })

    expect(result.current.conversations).toHaveLength(1)

    await act(async () => {
      await clearConversationsAction()
    })

    expect(result.current.conversations).toHaveLength(0)
    expect(result.current.activeConversationId).toEqual('')
  })

  it('upate conversations settings', async () => {
    const conversations = createConversation()

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

  describe('messages actions', () => {
    it('add text message', async () => {
      const { result } = renderHook(() => useConversationsStore())

      const conversation = createConversation()
      const message: IMessage = createMessage({
        id: '1' as MessageId,
        role: Role.USER,
        content: 'test',
        createAt: 1,
        convId: conversation.id,
      })

      await act(async () => {
        await addConversationsAction(conversation)
      })

      await act(async () => {
        await addMessageAction(message)
      })

      expect(result.current.messages).toEqual([message])
    })

    it('add image message', async () => {
      const { result } = renderHook(() => useConversationsStore())

      const conversation = createConversation()

      const message: IMessage = createMessage({
        content: 'text',
        images: [{ uid: '1', name: 'test', data: 'https://example.com/image.jpg', size: 100, type: 'image/jpeg' }],
        convId: conversation.id,
      })

      await act(async () => {
        await addConversationsAction(conversation)
      })

      await act(async () => {
        await addMessageAction(message)
      })

      expect(result.current.messages).toEqual([message])
    })

    it('update message', async () => {
      const { result } = renderHook(() => useConversationsStore())

      const conversation = createConversation()
      const message = createMessage({ convId: conversation.id, role: Role.USER, content: 'test', createAt: 1 })

      const newMessage = { ...message, content: 'new content' }

      await act(async () => {
        await addConversationsAction(conversation)
        await addMessageAction(message)
      })

      await act(async () => {
        await updateMessageAction(newMessage)
      })

      expect(result.current.messages).toEqual([newMessage])
    })

    it('delete message', async () => {
      const { result } = renderHook(() => useConversationsStore())

      const conversation = createConversation()
      const message = createMessage({ convId: conversation.id, role: Role.USER, content: 'test', createAt: 1 })

      await act(async () => {
        await addConversationsAction(conversation)
        await addMessageAction(message)
      })

      expect(result.current.messages).toEqual([message])

      await act(async () => {
        await deleteMessageAction(message.id)
      })

      expect(result.current.messages).toEqual([])
    })
  })
})
