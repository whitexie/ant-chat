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

  it('should be able to get mcp settings file path', async () => {
    const _mcpSettings = {
      mcpServers: {
        'amap-maps': {
          command: 'npx',
          args: ['-y', '@amap/amap-maps-mcp-server'],
          env: { AMAP_MAPS_API_KEY: '8bb1b0f92585b100072d61ceed4de14d' },
        },
      },
    }

    vi.mocked(os.homedir).mockReturnValue('/Users/ant-chat')
    vi.mocked(fs.readFile).mockResolvedValue(JSON.stringify(_mcpSettings))

    const mcpClient = new MCPClientHub()
    await mcpClient.initializePromise

    const mcpSettingsFilePath = mcpClient.getMcpSettingsFilePath()

    console.log('tools', JSON.stringify(await mcpClient.fetchToolsList('amap-maps'), null, 2))

    expect(mcpSettingsFilePath).toBe('/Users/ant-chat/.ant-chat/mcp-settings.json')
  })
})
