import type { McpConfigSchema, McpServer, TextResult } from '@ant-chat/shared'
import { MCPClientHub } from '@ant-chat/mcp-client-hub'
import { createIpcResponse } from '@ant-chat/shared'
import { mainEmitter, mainListener } from '../utils/ipc-events-bus'
import { logger } from '../utils/logger'
import { Notification } from '../utils/notification'
import { getMainWindow } from '../window'

export class McpService {
  private readonly mcpHub: MCPClientHub

  constructor() {
    this.mcpHub = new MCPClientHub()
    this.mcpHub.addErrorCallback((name, err) => {
      logger.debug('call onErrorCallback => ', name, err)
      Notification.error({ message: `${name} connect fail.`, description: err.message })
    })
  }

  registerEvent() {
    mainListener.handle('mcp:getConnections', async (_e) => {
      const result: Pick<McpServer, 'name' | 'config' | 'tools' | 'status'>[] = this.mcpHub.connections.map((item) => {
        const { server } = item
        const { name, config, tools = [], status } = server

        return { name, config, tools, status }
      })

      return createIpcResponse(true, result)
    })

    mainListener.handle('mcp:getAllAvailableToolsList', async () => {
      const data = this.mcpHub.getAllAvailableToolsList()
      return createIpcResponse(true, data)
    })

    mainListener.handle('mcp:callTool', async (_, serverName: string, toolName: string, toolArguments?: Record<string, unknown>) => {
      logger.debug('mcp:callTool', serverName, toolName, toolArguments)
      const data = await this.mcpHub.callTool(serverName, toolName, toolArguments)

      // data.content.forEach((item) => {
      //   if (item.type === 'resource') {
      //     console.log(item.resource.blob)
      //     console.log(item.resource?.mimeType)
      //     console.log(item.resource.text)
      //     console.log(item.resource.uri)
      //   }
      // })

      // TODO 暂时只支持处理text
      const content = data.content
        .filter(item => item.type === 'text')
        .map(item => ({ type: 'text', text: item.text })) as TextResult[]

      return createIpcResponse(true, { content, isError: data.isError })
    })

    mainListener.handle('mcp:connectMcpServer', async (_, name: string, mcpConfig: McpConfigSchema) => {
      logger.debug('mcp:connectMcpServer', name, JSON.stringify(mcpConfig))
      let ok = false
      let msg = ''
      let status: 'connected' | 'disconnected' = 'connected'
      const mainWindow = getMainWindow()
      try {
        ok = await this.mcpHub.connectToServer(name, mcpConfig)
      }
      catch (e) {
        logger.error('connect mcp server error', e)
        status = 'disconnected'
        if (mainWindow) {
          msg = (e as Error).message
          Notification.error({ message: `${name} connect fail.`, description: msg })
        }
      }

      if (mainWindow) {
        mainEmitter.send(mainWindow.webContents, 'mcp:McpServerStatusChanged', name, status)
      }
      return createIpcResponse(ok, null, msg)
    })

    mainListener.handle('mcp:disconnectMcpServer', async (_, name: string) => {
      logger.debug('mcp:disconnectMcpServer', name)
      const ok = await this.mcpHub.deleteConnection(name)
      return createIpcResponse(ok, null)
    })

    mainListener.handle('mcp:reconnectMcpServer', async (_, name: string, mcpConfig: McpConfigSchema) => {
      logger.debug('mcp:reconnectMcpServer', name)
      let ok = true
      let msg = ''
      try {
        await this.mcpHub.deleteConnection(name)
        await this.mcpHub.connectToServer(name, mcpConfig)
      }
      catch (e) {
        ok = false
        msg = (e as Error).message
      }

      return createIpcResponse(ok, null, msg)
    })

    mainListener.handle('mcp:fetchMcpServerTools', async (_, name: string) => {
      const data = await this.mcpHub.fetchToolsList(name)
      return createIpcResponse(true, data)
    })

    mainListener.handle('mcp:mcpToggle', async (_, isEnable: boolean, mcpConfigs?: McpConfigSchema[]) => {
      logger.debug('mcp:mcpToggle', isEnable, mcpConfigs)
      if (isEnable) {
        if (!mcpConfigs) {
          return createIpcResponse(false, null, 'needs mcpConfig')
        }
        this.mcpHub.initializeMcpServers(mcpConfigs)
      }
      else {
        this.mcpHub.connections
          .map(item => item.server.name)
          .forEach((name) => {
            this.mcpHub.deleteConnection(name)
          })
      }
      return createIpcResponse(true, null)
    })
  }
}
