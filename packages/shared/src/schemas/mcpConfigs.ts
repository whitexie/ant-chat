import { z } from 'zod'

export const BaseMcpConfig = z.object({
  serverName: z.string(),
  icon: z.string(),
  description: z.string().optional(),
  timeout: z.number().optional(),
  transportType: z.enum(['stdio', 'sse']),
  createAt: z.number(),
  updateAt: z.number(),
})

export const SSEMcpConfig = BaseMcpConfig.extend({
  transportType: z.literal('sse'),
  url: z.string().url(),
})

export type SSeMcpConfig = z.infer<typeof SSEMcpConfig>

export const StdioMcpConfig = BaseMcpConfig.extend({
  transportType: z.literal('stdio'),

  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.any()).optional(),
})

export type StdioMcpConfig = z.infer<typeof StdioMcpConfig>

export const AddMcpConfigSchema = z.union([SSEMcpConfig, StdioMcpConfig])
export type AddMcpConfigSchema = z.infer<typeof AddMcpConfigSchema>

export const McpConfigSchema = z.union([SSEMcpConfig, StdioMcpConfig])
export type McpConfigSchema = z.infer<typeof McpConfigSchema>

export const UpdateMcpConfigSchema = z.union([
  SSEMcpConfig.partial().extend({ serverName: z.string() }),
  StdioMcpConfig.partial().extend({ serverName: z.string() }),
])
export type UpdateMcpConfigSchema = z.infer<typeof UpdateMcpConfigSchema>
