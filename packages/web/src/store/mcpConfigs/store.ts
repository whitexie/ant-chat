import type { McpConfig } from '@/db/interface'
import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface McpConfigsState {
  mcpServerRuningStatusMap: Record<string, 'connected' | 'connecting' | 'disconnected'>
  mcpConfigs: McpConfig[]
}

export const useMcpConfigsStore = create<McpConfigsState>()(
  devtools(
    () => ({
      mcpServerRuningStatusMap: {},
      mcpConfigs: [],
    }),
    {
      enabled: import.meta.env.MODE === 'development',
    },
  ),
)
