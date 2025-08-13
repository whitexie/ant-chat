import { McpConfigSchema } from '@ant-chat/shared'
import { z } from 'zod'

export const DEFAULT_REQUEST_TIMEOUT_MS = 5000
export const DEFAULT_MCP_TIMEOUT_SECONDS = 30

export const McpSettingsSchema = z.object({
  mcpServers: z.record(McpConfigSchema),
})

export type McpSettings = z.infer<typeof McpSettingsSchema>
