import { runtimeModelConfig } from '@/hooks/useModelConfig'

export async function getModels(apiHost: string, apiKey: string) {
  const resp = await fetch(`${apiHost}/models`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  })
  return ((await resp.json()) as ModelsResponse).data
}

export async function sendChatMessage(messages: API.MessageItem[], modelId: string) {
  const { temperature } = runtimeModelConfig
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
  })

  if (!resp.ok || !resp.body) {
    throw new Error('request fail')
  }

  return {
    // reader: resp.body.getReader(),
    response: resp,
  }
}

async function request(url: string, options?: RequestInit) {
  const { apiHost, apiKey } = runtimeModelConfig
  const _url = apiHost + url
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
