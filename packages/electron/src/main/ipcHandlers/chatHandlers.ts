import { handleChatCompletions } from '@main/ai-providers/services/chat-service'
import { mainListener } from '@main/utils/ipc-events-bus'

export function registerChatHandlers() {
  mainListener.on('chat:send-chat-completions', async (_, options) => {
    handleChatCompletions(options)
  })
}
