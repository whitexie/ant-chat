import { decryptData, encryptData } from '@/utils'
import { useLocalStorageState } from 'ahooks'
import { pick } from 'lodash-es'

const LOCAL_STORAGE_KEY = 'model-config'

const DEFAULT_CONFIG: ModelConfig = {
  apiHost: import.meta.env.VITE_API_HOST,
  apiKey: import.meta.env.VITE_API_KEY,
  model: import.meta.env.VITE_DEFAULT_MODEL,
  temperature: 0.7,
}

export const runtimeModelConfig = DEFAULT_CONFIG

export function updateRuntimeModelConfig(config: ModelConfig) {
  Object.assign(runtimeModelConfig, pick(config, ['apiHost', 'apiKey', 'model', 'temperature']))
}

export default function useModelConfig() {
  const [config, setConfig] = useLocalStorageState<ModelConfig>(LOCAL_STORAGE_KEY, {
    defaultValue: DEFAULT_CONFIG,
    serializer: (value: ModelConfig) => {
      updateRuntimeModelConfig(value)
      return encryptData(value)
    },
    deserializer: (value: string) => {
      const config = decryptData(value)
      updateRuntimeModelConfig(config)
      return config
    },
  })

  return {
    config,
    setConfig,
  }
}
