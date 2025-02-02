import type { SSEOutput, XStreamOptions } from '@/utils/stream'
import type { ChatCompletionsCallbacks } from './interface'
import { Stream } from '@/utils'

export async function parseSse(options: XStreamOptions<SSEOutput>, callbacks?: ChatCompletionsCallbacks) {
  let __content__ = ''

  for await (const chunk of Stream(options)) {
    if (!chunk.data)
      continue

    try {
      const json = JSON.parse(chunk.data)
      const content = json.candidates?.[0]?.content?.parts?.[0]?.text
      if (content) {
        __content__ += content

        callbacks?.onUpdate?.(__content__)
      }
    }
    catch (e) {
      const error = e as Error
      if (!chunk.data.includes('[DONE]')) {
        console.error('parse Stream error', error)
      }
      callbacks?.onError?.(error)
    }
  }
  callbacks?.onSuccess?.(__content__)

  return __content__
}
