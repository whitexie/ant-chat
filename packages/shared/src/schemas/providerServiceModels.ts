
import {z} from 'zod'

export const ModelFeaturesSchema = z.object({
  functionCall: z.boolean().optional(),
  deepThinking: z.boolean().optional(),
  vision: z.boolean().optional(),
})

export const ProviderServiceModelsSchema = z.object({
  id: z.string(),
  model: z.string(),isBuiltin: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  isEnabled: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  modelFeatures: ModelFeaturesSchema.optional().nullable(),
  providerServiceId: z.string(),
  createdAt: z.number(),
})

export type ProviderServiceModelsSchema = z.infer<typeof ProviderServiceModelsSchema>
