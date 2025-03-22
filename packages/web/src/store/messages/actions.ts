import type { ConversationsId, IMessage, MessageId, ModelConfig } from '@/db/interface'
import type { ChatFeatures } from '../features'
import type { RequestStatus } from './store'
import { Role } from '@/constants'
import { addMessage, deleteMessage, getMessagesByConvIdWithPagination, getSystemMessageByConvId, updateMessage } from '@/db'
import { getServiceProviderConstructor } from '@/services-provider'
import { produce } from 'immer'
import { createMessage } from '../conversation'
import { useMessagesStore } from './store'

export function setRequestStatus(status: RequestStatus) {
  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.requestStatus = status
  }))
}

export async function setActiveConversationsId(id: ConversationsId | '') {
  const { pageSize } = useMessagesStore.getState()
  const { messages, total } = id ? await getMessagesByConvIdWithPagination(id, 0, pageSize) : { messages: [], total: 0 }

  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.activeConversationsId = id as ConversationsId
    draft.messages.splice(0, draft.messages.length, ...messages)
    draft.pageIndex = 1
    draft.messageTotal = total
  }))
}

export async function addMessageAction(message: IMessage) {
  await addMessage(message)

  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.messages.push(message)
  }))
}

export async function deleteMessageAction(messageId: MessageId) {
  await deleteMessage(messageId)

  useMessagesStore.setState(state => produce(state, (draft) => {
    const index = draft.messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      draft.messages.splice(index, 1)
    }
  }))
}

export async function updateMessageAction(message: IMessage) {
  await updateMessage(message)

  useMessagesStore.setState(state => produce(state, (draft) => {
    const index = draft.messages.findIndex(m => m.id === message.id)
    if (index === -1)
      throw new Error(`Message not found => ${message.id}`)

    draft.messages[index] = message
  }))
}

export function setAbortFunction(callback: () => void) {
  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.abortFunction = callback
  }))
}

export function resetAbortFunction() {
  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.abortFunction = null
  }))
}

export function abortSendChatCompletions() {
  try {
    useMessagesStore.getState().abortFunction?.()
  }
  catch (e) {
    console.log('execute abort callback fail => ', e)
  }
  finally {
    resetAbortFunction()
  }
}

export async function sendChatCompletions(conversationId: ConversationsId, config: ModelConfig, features: ChatFeatures) {
  const messages = useMessagesStore.getState().messages
  const aiMessage = createMessage({ convId: conversationId, role: Role.AI, status: 'loading' })

  // 这里aiMessage需要展开，避免被冻结， 后面的updateMessage同理
  await addMessageAction({ ...aiMessage })

  try {
    setRequestStatus('loading')
    const Service = getServiceProviderConstructor(config.id)
    const instance = new Service(config)

    const abortController = new AbortController()

    setAbortFunction(() => {
      abortController.abort()
      updateMessageAction({ ...aiMessage, status: 'cancel' })
    })

    const stream = await instance.sendChatCompletions(messages, { features, abortController })

    if (!stream) {
      throw new Error('stream is null')
    }

    const reader = stream.getReader()

    setAbortFunction(() => {
      reader.cancel()
      updateMessageAction({ ...aiMessage, status: 'cancel' })
    })

    await instance.parseSse(reader, {
      onUpdate: (result) => {
        aiMessage.content = result.message
        aiMessage.reasoningContent = result.reasoningContent
        updateMessageAction({ ...aiMessage, status: 'typing' })
      },
      onSuccess: () => {
        setRequestStatus('success')
        updateMessageAction({ ...aiMessage, status: 'success' })
        resetAbortFunction()
      },
      onError: () => {
        setRequestStatus('error')
        updateMessageAction({ ...aiMessage, status: 'error' })
      },
    })
  }
  catch (e) {
    const error = e as Error
    aiMessage.content = error.message
    aiMessage.status = 'error'
    updateMessageAction(aiMessage)
    setRequestStatus('error')
  }
}

export async function onRequestAction(conversationId: ConversationsId, config: ModelConfig, features: ChatFeatures) {
  await sendChatCompletions(conversationId, config, features)
}

export async function refreshRequestAction(conversationId: ConversationsId, message: IMessage, config: ModelConfig, features: ChatFeatures) {
  await deleteMessageAction(message.id)
  await sendChatCompletions(conversationId, config, features)
}

export async function updateConversationsSystemPrompt(conversationsId: ConversationsId, systemPrompt: string) {
  const systemMessage = await getSystemMessageByConvId(conversationsId)
  if (!systemMessage) {
    console.error('conversations not found system message')
    return
  }

  await updateMessage(createMessage({ ...systemMessage, content: systemPrompt }))
}

export async function nextPageMessagesAction(conversationsId: ConversationsId) {
  const { pageIndex, pageSize } = useMessagesStore.getState()
  const { messages, total } = await getMessagesByConvIdWithPagination(conversationsId, pageIndex, pageSize)

  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.messages.splice(0, 0, ...messages)
    // draft.messages.sort((a, b) => a.createAt - b.createAt)
    draft.pageIndex = pageIndex + 1
    draft.messageTotal = total
  }))
}
