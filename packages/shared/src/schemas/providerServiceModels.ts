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
  name: z.string(),
  isBuiltin: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  isEnabled: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  modelFeatures: ModelFeaturesSchema.optional().nullable(),
  providerServiceId: z.string(),
  createdAt: z.number(),
})

export const AllAvailableModels = ProviderServiceSchema.omit({ isEnabled: true }).extend({
  models: z.array(ProviderServiceModelsSchema.pick({ id: true, name: true, model: true, modelFeatures: true, providerServiceId: true })),
})

export const AddProviderServiceModelSchema = ProviderServiceModelsSchema.pick({ name: true, model: true, providerServiceId: true })

// ============================ Schema 转换类型 ============================
export type AddProviderServiceModelSchema = z.infer<typeof AddProviderServiceModelSchema>

export type ModelFeaturesSchema = z.infer<typeof ModelFeaturesSchema>

export type AllAvailableModelsSchema = z.infer<typeof AllAvailableModels>

export type ProviderServiceModelsSchema = z.infer<typeof ProviderServiceModelsSchema>
