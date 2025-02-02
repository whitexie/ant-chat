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
    const config = { model: 'gpt-4o', apiHost: 'https://api.openai.com', apiKey: 'sk-1234567890', temperature: 0.1, systemMessage: 'You are a helpful assistant.' }
    act(() => {
      setConfigAction(config)
    })

    expect(result.current.configMapping.Gemini.model).toBe(config.model)
    expect(result.current.configMapping.Gemini.apiHost).toBe(config.apiHost)
    expect(result.current.configMapping.Gemini.apiKey).toBe(config.apiKey)
    expect(result.current.configMapping.Gemini.temperature).toBe(config.temperature)
  })
})
