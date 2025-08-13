import fs from 'node:fs/promises'
import os from 'node:os'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MCPClientHub } from '../index'

vi.mock('node:os')
vi.mock('node:fs/promises')

describe('mcp client', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
})
