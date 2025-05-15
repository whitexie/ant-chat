import { pick } from 'lodash-es'
import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { useShallow } from 'zustand/shallow'

export const initialState = {
  /** 联网搜索 */
  onlineSearch: false,
  /** MCP */
  enableMCP: false,
}

export const initialStateKeys = Object.keys(initialState) as (keyof ChatFeatures)[]

export type ChatFeatures = typeof initialState

interface Action {
  setOnlieSearch: (value: boolean) => void
  setEnableMCP: (value: boolean) => void
}

const useFeaturesStore = create<ChatFeatures & Action>()(
  devtools(
    persist(
      set => ({
        ...initialState,
        setOnlieSearch: (value: boolean) => set({ onlineSearch: value }),
        setEnableMCP: (value: boolean) => set({ enableMCP: value }),
      }),
      {
        name: 'feature',
      },
    ),
    {
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)

export function useFeatures() {
  return useFeaturesStore(useShallow(state => ({
    setOnlieSearch: state.setOnlieSearch,
    setEnableMCP: state.setEnableMCP,
  })))
}

export function useMcpStore() {
  return useFeaturesStore(useShallow(state => ({ enableMCP: state.enableMCP, setEnableMCP: state.setEnableMCP })))
}

export function useFeaturesState() {
  return useFeaturesStore(useShallow(state => pick(state, initialStateKeys)))
}

export function getFeatures(): ChatFeatures {
  return pick(useFeaturesStore.getState(), initialStateKeys)
}

export default useFeaturesStore
