import type { RequestFn, XAgentConfig } from '@ant-design/x/es/useXAgent'
import { XRequest } from '@ant-design/x'

let uuid = 0

class Agent<Message = string> {
  config: XAgentConfig<Message>

  private requestingMap: Record<number, boolean> = {}

  constructor(config: XAgentConfig<Message>) {
    this.config = config
  }

  finishRequest(id: number) {
    delete this.requestingMap[id]
  }

  public request: RequestFn<Message> = (info, callbacks) => {
    const { request } = this.config
    const { onUpdate, onSuccess, onError } = callbacks

    const id = uuid
    uuid += 1
    this.requestingMap[id] = true

    request?.(info, {
      // Status should be unique.
      // One get success or error should not get more message
      onUpdate: (message) => {
        if (this.requestingMap[id]) {
          onUpdate(message)
        }
      },
      onSuccess: (message) => {
        if (this.requestingMap[id]) {
          onSuccess(message)
          this.finishRequest(id)
        }
      },
      onError: (error) => {
        if (this.requestingMap[id]) {
          onError(error)
          this.finishRequest(id)
        }
      },
    })
  }

  public isRequesting() {
    return Object.keys(this.requestingMap).length > 0
  }
}

export function useAgent<Message = string>(config: XAgentConfig<Message>) {
  const { request, ...restConfig } = config
  return [
    new Agent<Message>({
      request: request! || XRequest({
        baseURL: restConfig.baseURL!,
        model: restConfig.model,
        dangerouslyApiKey: restConfig.dangerouslyApiKey,
      }).create,
      ...restConfig,
    }),
  ]
}
