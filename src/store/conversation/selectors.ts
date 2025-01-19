import type { ConversationsStore } from './conversationsStore'

export function activeConversationSelector(state: ConversationsStore) {
  const activeConversation = state.conversations.find(conv => conv.id === state.activeConversationId)
  return {
    activeConversation,
    addMessage: state.addMessage,
    updateMessage: state.updateMessage,
    onRequest: state.onRequest,
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
