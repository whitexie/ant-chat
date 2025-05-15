import type { McpServerConfig, McpSettings } from '@ant-chat/mcp-client-hub'
import type { McpServer } from '@ant-chat/shared'
import { MCPClientHub } from '@ant-chat/mcp-client-hub'
import { ipcEvents } from '@ant-chat/shared'
import { createIpcResponse, mainListener } from '../utils/ipc-events-bus'
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
      return createIpcResponse(true, data)
    })

    mainListener.handle('mcp:connectMcpServer', async (_, name: string, mcpConfig: McpServerConfig) => {
      logger.debug('mcp:connectMcpServer', name, JSON.stringify(mcpConfig))
      let ok = false
      let msg = ''
      let status = 'connected'
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
        mainWindow.webContents.send(ipcEvents.MCP_SERVER_STATUS_CHANGED, name, status)
      }
      return createIpcResponse(ok, null, msg)
    })

    mainListener.handle(ipcEvents.DISCONNECT_MCP_SERVER, async (_, name: string) => {
      logger.debug(ipcEvents.DISCONNECT_MCP_SERVER, name)
      const ok = await this.mcpHub.deleteConnection(name)
      return createIpcResponse(ok, null)
    })

    mainListener.handle(ipcEvents.RECONNECT_MCP_SERVER, async (_, name: string, mcpConfig: McpServerConfig) => {
      logger.debug(ipcEvents.RECONNECT_MCP_SERVER, name)
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

    mainListener.handle(ipcEvents.MCP_TOGGLE, async (_, isEnable: boolean, mcpConfig?: McpSettings) => {
      logger.debug(ipcEvents.MCP_TOGGLE, isEnable, mcpConfig)
      if (isEnable) {
        if (!mcpConfig) {
          return createIpcResponse(false, null, 'needs mcpConfig')
        }
        this.mcpHub.initializeMcpServers(mcpConfig)
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
