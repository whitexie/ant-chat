import { createIpcResponse } from '@ant-chat/shared'
import { handleInitConversationTitle } from '@main/ai-providers/services/chat-service'
import { updateConversation } from '@main/db/services'
import { mainListener } from '@main/utils/ipc-events-bus'

export function registerChatServiceEvent() {
  mainListener.handle('chat:create-conversations-title', async (_, options) => {
    const title = await handleInitConversationTitle(options)
    const udpatedConversations = await updateConversation({
      id: options.conversationsId,
      title,
    })
    return createIpcResponse(true, udpatedConversations)
  })
}
