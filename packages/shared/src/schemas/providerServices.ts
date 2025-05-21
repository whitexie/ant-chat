import { z } from 'zod'

export const ProviderServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  apiMode: z.enum(['openai', 'anthropic', 'gemini']),
  isOfficial: z.boolean(),
  isEnabled: z.boolean(),
  createdAt: z.number(),
  updatedAt: z.number(),
})

export const AddProviderServiceSchema = ProviderServiceSchema
  .omit({ isOfficial: true, updatedAt: true, createdAt: true })
  .partial({ isEnabled: true, id: true })
  .required({ apiKey: true })
  .transform(config => ({ ...config, isOfficial: false }))

export const UpdateProviderServiceSchema = ProviderServiceSchema
  .omit({ updatedAt: true, createdAt: true })
  .partial()
  .required({ id: true })

export type AddProviderServiceSchema = z.infer<typeof AddProviderServiceSchema>
export type UpdateProviderServiceSchema = z.infer<typeof UpdateProviderServiceSchema>
export type ProviderServiceSchema = z.infer<typeof ProviderServiceSchema>
