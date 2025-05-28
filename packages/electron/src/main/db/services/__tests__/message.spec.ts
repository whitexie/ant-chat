import { beforeEach, describe, expect, it } from 'vitest'
import { mockDb } from './utils'
import { createMessage } from './factory'
import { updateMessage } from '../message'

describe('message service', () => {
  beforeEach(async () => {
    await mockDb()
  })

  describe('updateMessage', () => {
    it('更新包含error的content', async () => {
      let message = await createMessage({
        id: 'msg-XiOPzFnYVNEgTCj3h7csb',
        convId: 'conv-otDibEPk_83HIQ-EgO4ZK',
        role: 'assistant',
        content: [
          {
            type: 'error',
            error: 'Failed to deserialize the JSON body into the target type: messages[5]: data did not match any variant of untagged enum ChatCompletionRequestContent at line 1 column 1562573',
          } as const,
        ],
        createdAt: 1748395533791,
        status: 'error',
        images: [],
        attachments: [],
        reasoningContent: null,
        mcpTool: null,
        modelInfo: { provider: 'DeepSeek', model: 'deepseek-chat' },
      })
      message = await updateMessage({
        id: message.id,
        content: [...message.content, { type: 'error', error: 'Test Error' } as const],
      })

      expect(message.content).toEqual([
        { type: 'text', text: 'hello' },
        { type: 'error', error: 'Test Error' },
      ])
    })
  })
})
