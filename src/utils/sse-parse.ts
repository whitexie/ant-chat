import Stream from './stream'

interface ParseSseOptions {
  onUpdate?: (content: string) => void
  onSuccess?: (content: string) => void
}

export async function parseSse(readableStream: ReadableStream, options?: ParseSseOptions) {
  let __content__ = ''

  for await (const chunk of Stream({ readableStream })) {
    if (!chunk.data)
      continue

    try {
      const json = JSON.parse(chunk.data)
      if (json.choices[0].delta.content) {
        const content = json.choices[0].delta.content
        __content__ += content
        options?.onUpdate?.(__content__)
      }
    }
    catch (e) {
      const error = e as Error
      if (!chunk.data.includes('[DONE]')) {
        console.error('parse Stream error', error)
      }
    }
  }

  options?.onSuccess?.(__content__)

  return __content__
}
