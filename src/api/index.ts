export async function getModels() {
  const resp = await request('/models')
  return ((await resp.json()) as ModelsResponse).data
}

export async function sendChatMessage(messages: API.MessageItem[], modelId: string) {
  const resp = await request('/chat/completions', {
    method: 'POST',
    headers: {
      'content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages: [
        ...messages,
      ],
      model: modelId,
      stream: true,
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
  const _url = import.meta.env.VITE_API_URL + url
  const _option = {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${import.meta.env.VITE_OPENAI_ACCESS_KEY}`,
    },
  }
  return await fetch(_url, _option)
}

interface ModelsResponse {
  object: 'list'
  data: API.ChatModel[]
}
