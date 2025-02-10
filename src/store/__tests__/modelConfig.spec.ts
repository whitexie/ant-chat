import type { ModelConfig, ModelConfigId } from '@/db/interface'
import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setConfigAction, setModelAction, useModelConfigStore } from '../modelConfig'

describe('modelConfig', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useModelConfigStore())
    act(() => {
      result.current.reset()
    })
  })

  it('should be able to set model', () => {
    const { result } = renderHook(() => useModelConfigStore())
    act(() => {
      setModelAction('gpt-4o')
    })
    expect(result.current.configMapping.Gemini.model).toBe('gpt-4o')
  })

  it('setConfig', () => {
    const { result } = renderHook(() => useModelConfigStore())
    const config: ModelConfig = { id: 'OpenAI' as ModelConfigId, model: 'gpt-4o', apiHost: 'https://api.openai.com', apiKey: 'sk-1234567890', temperature: 0.1 }
    act(() => {
      setConfigAction(config.id, config)
    })

    expect(result.current.configMapping.OpenAI.model).toBe(config.model)
    expect(result.current.configMapping.OpenAI.apiHost).toBe(config.apiHost)
    expect(result.current.configMapping.OpenAI.apiKey).toBe(config.apiKey)
    expect(result.current.configMapping.OpenAI.temperature).toBe(config.temperature)
  })
})
