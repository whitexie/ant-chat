import type { handleChatCompletionsOptions } from '@ant-chat/shared'
import { emitter } from '@/utils/ipc-bus'

function sendChatCompletions(options: handleChatCompletionsOptions) {
  return emitter.send('chat:send-chat-completions', options)
}

export default {
  sendChatCompletions,
}
