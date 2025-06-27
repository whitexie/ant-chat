import type { handleChatCompletionsOptions, SendChatCompletionsOptions, TextContent } from '@ant-chat/shared'
import type { AIProvider } from '../providers/interface'
import { createAIMessage, getMessagesByConvId, getProviderServiceById, updateMessage } from '@main/db/services'
import { mainEmitter } from '@main/utils/ipc-events-bus'
import { getMainWindow } from '@main/window'
import { AIProviderMapping } from '../providers'

class ChatService {
  private aiProvider: AIProvider | null = null

  async initializeProvider(providerId: string) {
    const provider = getProviderServiceById(providerId)
    if (!provider) {
      throw new Error('Provider not found')
    }

    if (!(provider.apiMode in AIProviderMapping)) {
      throw new Error(`not support apiMode: ${provider.apiMode}`)
    }

    const aiProvider = new AIProviderMapping[provider.apiMode]({
      baseUrl: provider.baseUrl,
      apiKey: provider.apiKey,
    })
    this.aiProvider = aiProvider
  }

  async sendChatCompletions(options: SendChatCompletionsOptions) {
    if (!this.aiProvider) {
      throw new Error('AI provider not set')
    }

    return this.aiProvider.sendChatCompletions(options)
  }
}

export async function handleChatCompletions(options: handleChatCompletionsOptions) {
  const { conversationsId, chatSettings } = options

  const messages = await getMessagesByConvId(conversationsId)

  const chatService = new ChatService()

  chatService.initializeProvider(chatSettings.providerId)

  const stream = await chatService.sendChatCompletions({ messages, chatSettings })

  const aiMessage = await createAIMessage(
    conversationsId,
    {
      provider: chatSettings.providerId,
      model: chatSettings.model,
    },
  )

  for await (const chunk of stream) {
    const { reasoningContent, content, functionCalls } = chunk
    if (reasoningContent) {
      aiMessage.reasoningContent += reasoningContent
    }

    if (content) {
      const aiContent = aiMessage.content
      // 合并连续的文本消息
      content.forEach((item) => {
        if (item.type === 'text' && aiContent.length > 0 && aiContent[aiContent.length - 1].type === 'text') {
          (aiContent[aiContent.length - 1] as TextContent).text += item.text
        }
        else {
          aiContent.push(item)
        }
      })
    }

    if (functionCalls) {
      aiMessage.mcpTool = functionCalls
    }

    // 合并到数据库
    const updatedMessage = await updateMessage({
      id: aiMessage.id,
      role: 'assistant',
      content: aiMessage.content,
      reasoningContent: aiMessage.reasoningContent,
    })

    const mianWindow = getMainWindow()

    if (!mianWindow) {
      throw new Error('not found mainWindow')
    }

    // 将最新的消息推送给前端
    mainEmitter.send(mianWindow.webContents, 'chat:stream-message', updatedMessage)
  }

  updateMessage({ id: aiMessage.id, role: 'assistant', status: 'success' })
}
