import z from 'zod'

export const DEFAULT_REQUEST_TIMEOUT_MS = 5000
export const DEFAULT_MCP_TIMEOUT_SECONDS = 30

export const BaseConfigSchema = z.object({
  disabled: z.boolean().optional(),
  timeout: z.number().min(DEFAULT_REQUEST_TIMEOUT_MS).optional().default(DEFAULT_REQUEST_TIMEOUT_MS),
})

export const SseConfigSchema = BaseConfigSchema.extend({
  url: z.string().url(),
}).transform(config => ({
  ...config,
  transportType: 'sse' as const,
}))

export const StdioConfigSchema = BaseConfigSchema.extend({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
}).transform(config => ({
  ...config,
  transportType: 'stdio' as const,
}))

export const ServerConfigSchema = z.union([StdioConfigSchema, SseConfigSchema])

export const McpSettingsSchema = z.object({
  mcpServers: z.record(ServerConfigSchema),
})

export type McpServerConfig = z.infer<typeof ServerConfigSchema>
export type McpSettings = z.infer<typeof McpSettingsSchema>
