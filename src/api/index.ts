import { getActiveModelConfig } from '@/store/modelConfig'

export async function getModels(apiHost: string, apiKey: string) {
  const resp = await fetch(`${apiHost}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  return ((await resp.json()) as ModelsResponse).data
}

export async function chatCompletions(messages: API.MessageItem[], modelId: string) {
  const { temperature } = getActiveModelConfig()
  const abortController = new AbortController()
  const resp = await request('/chat/completions', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model: modelId,
      stream: true,
      temperature,
    }),
    signal: abortController.signal,
  })

  if (!resp.ok) {
    if (`${resp.status}`.startsWith('4')) {
      const json = await resp.json()
      console.log('request fail json => ', json)
      throw new Error(json.error.message)
    }
    throw new Error('request fail')
  }

  return {
    response: resp,
    abort: () => abortController.abort(),
  }
}

async function request(url: string, options?: RequestInit) {
  const { apiHost, apiKey } = getActiveModelConfig()
  const _url: URL | string = new URL(apiHost)
  _url.pathname += url

  const _option = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${apiKey}`,
    },
  }
  return await fetch(_url, _option)
}

interface ModelsResponse {
  object: 'list'
  data: API.ChatModel[]
}
