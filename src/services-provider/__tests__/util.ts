import type { XReadableStream } from '@/utils/stream'
import Stream from '@/utils/stream'

export function createMockStream(lines: string[], DEFAULT_STREAM_SEPARATOR = '\n\n', DEFAULT_PART_SEPARATOR = '\n'): XReadableStream {
  const encoder = new TextEncoder()
  return Stream({
    readableStream: new ReadableStream({
      async start(controller) {
        // 遍历传入的字符串数组
        for (const line of lines) {
          // 保持原有的模拟格式和延迟逻辑
          controller.enqueue(encoder.encode(`${line}${DEFAULT_STREAM_SEPARATOR}`))
          await new Promise(resolve => setTimeout(resolve, 10))
        }
        controller.close()
      },
    }),
    DEFAULT_STREAM_SEPARATOR,
    DEFAULT_PART_SEPARATOR,
  })
}

export function createMockResponse(body?: unknown, options?: ResponseInit): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })
}
