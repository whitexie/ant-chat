import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useModelConfigStore } from '../modelConfig'

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
      result.current.setModel('gpt-4o')
    })
    expect(result.current.model).toBe('gpt-4o')
  })

  it('setConfig', () => {
    const { result } = renderHook(() => useModelConfigStore())
    const config = { model: 'gpt-4o', apiHost: 'https://api.openai.com', apiKey: 'sk-1234567890', temperature: 0.1 }
    act(() => {
      result.current.setConfig(config)
    })

    expect(result.current.model).toBe(config.model)
    expect(result.current.apiHost).toBe(config.apiHost)
    expect(result.current.apiKey).toBe(config.apiKey)
    expect(result.current.temperature).toBe(config.temperature)
  })
})
