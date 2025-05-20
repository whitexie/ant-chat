import { z } from 'zod'
import { ProviderServiceSchema } from './providerServices'

export const ModelFeaturesSchema = z.object({
  functionCall: z.boolean().optional(),
  deepThinking: z.boolean().optional(),
  vision: z.boolean().optional(),
})

export const ProviderServiceModelsSchema = z.object({
  id: z.string(),
  model: z.string(),
  isBuiltin: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  isEnabled: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  modelFeatures: ModelFeaturesSchema.optional().nullable(),
  providerServiceId: z.string(),
  createdAt: z.number(),
})

export const AllAvailableModels = ProviderServiceSchema.omit({ isEnabled: true }).extend({
  models: z.array(ProviderServiceModelsSchema.pick({ model: true, modelFeatures: true })),
})

export type AllAvailableModelsSchema = z.infer<typeof AllAvailableModels>

export type ProviderServiceModelsSchema = z.infer<typeof ProviderServiceModelsSchema>
