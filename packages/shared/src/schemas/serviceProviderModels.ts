import { z } from 'zod'
import { ServiceProviderSchema } from './serviceProvider'

export const ModelFeaturesSchema = z.object({
  functionCall: z.boolean().optional(),
  deepThinking: z.boolean().optional(),
  vision: z.boolean().optional(),
})

export const ServiceProviderModelsSchema = z.object({
  id: z.string(),
  model: z.string(),
  name: z.string(),
  isBuiltin: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  isEnabled: z.union([z.boolean(), z.number()]).transform(val => Boolean(val)),
  modelFeatures: ModelFeaturesSchema.optional().nullable(),
  serviceProviderId: z.string(),
  createdAt: z.number(),
})

export const AllAvailableModels = ServiceProviderSchema.omit({ isEnabled: true }).extend({
  models: z.array(ServiceProviderModelsSchema.pick({ id: true, name: true, model: true, modelFeatures: true, serviceProviderId: true })),
})

export const AddServiceProviderModelSchema = ServiceProviderModelsSchema.pick({ name: true, model: true, serviceProviderId: true })

// ============================ Schema 转换类型 ============================
export type AddServiceProviderModelSchema = z.infer<typeof AddServiceProviderModelSchema>

export type ModelFeaturesSchema = z.infer<typeof ModelFeaturesSchema>

export type AllAvailableModelsSchema = z.infer<typeof AllAvailableModels>

export type ServiceProviderModelsSchema = z.infer<typeof ServiceProviderModelsSchema>
