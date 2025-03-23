import { pick } from 'lodash-es'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

export const initialState = {
  /** 联网搜索 */
  onlineSearch: false,
  /** 深度思考 */
  deepThinking: false,
}

export const initialStateKeys = Object.keys(initialState) as (keyof ChatFeatures)[]

export type ChatFeatures = typeof initialState

interface Action {
  setOnlieSearch: (value: boolean) => void
  setDeepThinking: (value: boolean) => void
}

const useFeaturesStore = create<ChatFeatures & Action>()(
  devtools(
    set => ({
      ...initialState,
      setOnlieSearch: (value: boolean) => set({ onlineSearch: value }),
      setDeepThinking: (value: boolean) => set({ deepThinking: value }),
    }),
    {
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)

export function useFeatures() {
  return useFeaturesStore(useShallow(state => ({
    setOnlieSearch: state.setOnlieSearch,
    setDeepThinking: state.setDeepThinking,
  })))
}

export function useFeaturesState() {
  return useFeaturesStore(useShallow(state => pick(state, initialStateKeys)))
}

export function getFeatures(): ChatFeatures {
  return pick(useFeaturesStore.getState(), initialStateKeys)
}

export default useFeaturesStore
