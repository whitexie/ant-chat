import type { AllAvailableModelsSchema, ConversationsId, IMessage, MessageId } from '@ant-chat/shared'
import type { ChatFeatures } from '../features'
import type { RequestStatus } from './store'
import { produce } from 'immer'
import { createAIMessage } from '@/api/dataFactory'
import { dbApi } from '@/api/dbApi'
import { Role } from '@/constants'
import { getServiceProviderConstructor } from '@/services-provider'
import { useMessagesStore } from './store'

export function setRequestStatus(status: RequestStatus) {
  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.requestStatus = status
  }))
}

export async function setActiveConversationsId(id: ConversationsId | '') {
  const { pageSize } = useMessagesStore.getState()
  const { data: messages, total } = await dbApi.getMessagesByConvIdWithPagination(id, 0, pageSize)

  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.activeConversationsId = id as ConversationsId
    draft.messages.splice(0, draft.messages.length, ...messages)
    draft.pageIndex = 1
    draft.messageTotal = total
  }))
}

export async function addMessageAction(message: IMessage) {
  const data = await dbApi.addMessage(message)

  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.messages.push({ ...data })
  }))

  return data
}

export async function deleteMessageAction(messageId: MessageId) {
  await dbApi.deleteMessage(messageId)

  useMessagesStore.setState(state => produce(state, (draft) => {
    const index = draft.messages.findIndex(m => m.id === messageId)
    if (index !== -1) {
      draft.messages.splice(index, 1)
    }
  }))
}

export async function updateMessageAction(_message: IMessage) {
  const message = await dbApi.updateMessage(_message)

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

export async function sendChatCompletions(conversationId: ConversationsId, features: ChatFeatures, model: AllAvailableModelsSchema['models'][number]) {
  const messages = useMessagesStore.getState().messages

  const serviceProviderInfo = await dbApi.getProviderServiceById(model.providerServiceId)

  let aiMessage: IMessage = createAIMessage({
    convId: conversationId,
    role: Role.AI,
    status: 'loading',
    modelInfo: { model: model.model, provider: serviceProviderInfo.name },
  })

  // 这里重新赋值是获得id
  aiMessage = await addMessageAction(aiMessage)

  try {
    setRequestStatus('loading')
    const Service = getServiceProviderConstructor(serviceProviderInfo.id)
    const { enableMCP } = features
    const instance = new Service({
      apiHost: serviceProviderInfo.baseUrl,
      apiKey: serviceProviderInfo.apiKey,
      // TODO 暂时写死0.7， 后续从模型配置中获取，或者是用户在对话框中设置
      temperature: 0.7,
      enableMCP,
      model: model.model,
    })

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
        aiMessage.mcpTool = result.functioncalls
        updateMessageAction({ ...aiMessage, status: 'typing' })
      },
      onSuccess: (data) => {
        setRequestStatus('success')
        if (data.functioncalls) {
          aiMessage.mcpTool = data.functioncalls
        }
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
    aiMessage.content = [{ type: 'text', text: error.message }]
    aiMessage.status = 'error'
    updateMessageAction(aiMessage)
    setRequestStatus('error')
  }
}

export async function onRequestAction(conversationId: ConversationsId, features: ChatFeatures, model: AllAvailableModelsSchema['models'][number]) {
  await sendChatCompletions(conversationId, features, model)
}

export async function refreshRequestAction(conversationId: ConversationsId, message: IMessage, features: ChatFeatures, model: AllAvailableModelsSchema['models'][number]) {
  await deleteMessageAction(message.id)

  await sendChatCompletions(conversationId, features, model)
}

export async function nextPageMessagesAction(conversationsId: ConversationsId) {
  const { pageIndex, pageSize } = useMessagesStore.getState()
  const { data: messages, total } = await dbApi.getMessagesByConvIdWithPagination(conversationsId, pageIndex, pageSize)

  useMessagesStore.setState(state => produce(state, (draft) => {
    draft.messages.splice(0, 0, ...messages)
    draft.pageIndex = pageIndex + 1
    draft.messageTotal = total
  }))
}
