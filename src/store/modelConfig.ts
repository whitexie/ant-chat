import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'

interface Action {
  setConfig: (config: ModelConfig) => void
}

const initialState: ModelConfig = {
  model: '',
  apiHost: '',
  apiKey: '',
  temperature: 0.7,
}

type ModelConfigStore = ModelConfig & Action

export const useModelConfigStore = create<ModelConfigStore>()(immer(set => ({
  ...initialState,
  setConfig: (config) => {
    set(config)
  },
})))
