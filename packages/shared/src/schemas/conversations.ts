import { z } from 'zod'

export const ModelConfigSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  apiHost: z.string(),
  apiKey: z.string(),
  model: z.string(),
  temperature: z.number(),
})

// 会话设置
export const ConversationsSettingsSchema = z.object({
  modelConfig: z.union([ModelConfigSchema, z.null()]).optional(),
  systemPrompt: z.string().optional(),
})

export type ConversationsSettingsSchema = z.infer<typeof ConversationsSettingsSchema>

export const ConversationsSchema = z.object({
  id: z.string(),
  title: z.string(),
  createAt: z.number(),
  updateAt: z.number(),
  settings: ConversationsSettingsSchema.optional(),
})

export type ConversationsSchema = z.infer<typeof ConversationsSchema>

// ============================ Add Conversations Schema ============================
export const AddConversationsSchema = ConversationsSchema.omit({ id: true })
export type AddConversationsSchema = z.infer<typeof AddConversationsSchema>

// ============================ Update Conversations Schema ============================
export const UpdateConversationsSchema = ConversationsSchema.partial().extend({ id: z.string() })

export type UpdateConversationsSchema = z.infer<typeof UpdateConversationsSchema>
