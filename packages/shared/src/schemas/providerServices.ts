import { z } from 'zod'

export const ProviderServiceSchema = z.object({
  id: z.string(),
  name: z.string(),
  baseUrl: z.string().url(),
  apiKey: z.string().optional(),
  apiMode: z.enum(['openai', 'anthropic', 'gemini']),
  isOfficial: z.boolean(),
  isEnabled: z.boolean(),
})

export const AddProviderServiceSchema = ProviderServiceSchema.omit({ isOfficial: true }).partial({ isEnabled: true, id: true }).required({ apiKey: true }).transform(config => ({ ...config, isOfficial: false }))

export const UpdateProviderServiceSchema = ProviderServiceSchema.partial().required({ id: true })

export type AddProviderServiceSchema = z.infer<typeof AddProviderServiceSchema>
export type UpdateProviderServiceSchema = z.infer<typeof UpdateProviderServiceSchema>
export type ProviderServiceSchema = z.infer<typeof ProviderServiceSchema>
