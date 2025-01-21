import type { ConversationsStore } from './conversationsStore'

export function activeConversationSelector(state: ConversationsStore) {
  const activeConversation = state.conversations.find(conv => conv.id === state.activeConversationId)
  return {
    activeConversation,
    addMessage: state.addMessage,
    deleteMessage: state.deleteMessage,
    updateMessage: state.updateMessage,
    onRequest: state.onRequest,
    refreshRequest: state.refreshRequest,
  }
}

export function conversationsSelector(state: ConversationsStore) {
  return {
    activeConversationId: state.activeConversationId,
    conversations: state.conversations,
    addConversation: state.addConversation,
    renameConversation: state.renameConversation,
    deleteConversation: state.deleteConversation,
    importConversations: state.importConversations,
    clearConversations: state.clearConversations,
    setActiveConversationId: state.setActiveConversationId,
  }
}

export function requestStatusSelector(state: ConversationsStore) {
  return {
    requestStatus: state.requestStatus,
    setRequestStatus: state.setRequestStatus,
  }
}
