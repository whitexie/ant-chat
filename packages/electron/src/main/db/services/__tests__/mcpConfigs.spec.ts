import { beforeEach, describe, expect, it, vi } from 'vitest'
import { initializeTestDb } from '../../db' // 导入初始化函数和 db 实例
// 导入你需要测试的服务或函数
import { addMcpConfig, getMcpConfigs } from '../mcpConfigs' // 假设你有这两个函数

vi.mock('electron', () => ({
  app: {
    getPath: vi.fn((name: string) => `./fake/${name}`),
  },
}))

describe('mcpConfigs service', () => {
  // 在每个测试用例之前初始化数据库
  beforeEach(async () => {
    await initializeTestDb()
  })

  it('应该添加一个新的 Stdio MCP Server配置', async () => {
    const newConfig = {
      icon: '🛠️',
      serverName: 'amap-maps',
      command: 'npx',
      args: ['-y', '@amap/amap-maps-mcp-server'],
      env: { AMAP_MAPS_API_KEY: 'api_key' },
      transportType: 'stdio',
    }

    // 使用你的服务函数进行测试
    await addMcpConfig(newConfig as any)

    // 验证数据是否正确插入
    const configs = await getMcpConfigs()
    expect(configs).toHaveLength(1)
    expect(configs[0].serverName).toBe('amap-maps')
  })

  it('应该添加一个新的 SSE MCP Server配置', async () => {
    const newConfig: any = {
      icon: '🛠️',
      serverName: 'amap-maps-sse',
      url: 'https://mcp.amap.com/sse?key=您在高德官网上申请的key',
      transportType: 'sse',
    }

    // 使用你的服务函数进行测试
    await addMcpConfig(newConfig)

    // 验证数据是否正确插入
    const configs = await getMcpConfigs()
    expect(configs).toHaveLength(1)
    expect(configs[0].serverName).toBe('amap-maps-sse')
  })

  describe('边界测试', () => {
    it('添加一个 stdio Mcp Server，缺少command参数', async () => {
      const config: any = {
        serverName: 'test-stdio',
        icon: '🚛',
        transportType: 'stdio',
      }

      expect(() => addMcpConfig(config)).rejects.toThrowError('缺少command参数')
    })

    it('添加一个 sse Mcp Server，错误的url参数', async () => {
      const config: any = {
        serverName: 'test-stdio',
        icon: '🚛',
        transportType: 'sse',
        url: 'wwww.baidu.com',
      }

      expect(() => addMcpConfig(config)).rejects.toThrowError('url格式错误')
    })
  })
})
