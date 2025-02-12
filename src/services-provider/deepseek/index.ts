import type { ServiceConstructorOptions } from '../interface'
import OpenAIService from '../openai'

class DeepSeekService extends OpenAIService {
  constructor(options?: Partial<ServiceConstructorOptions>) {
    super(Object.assign({ apiHost: 'https://api.deepseek.com' }, options))
  }
}

export default DeepSeekService
