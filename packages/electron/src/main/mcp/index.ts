import type { McpServerConfig, McpSettings, McpSettingsSchema } from '@ant-chat/mcp-client-hub'
import { MCPClientHub } from '@ant-chat/mcp-client-hub'
import { ipcEvents } from '@ant-chat/shared'
import { ipcMain } from 'electron'
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
    ipcMain.handle(ipcEvents.GET_MCP_INITIALIZE_STATE, () => {
      return this.mcpHub.isInitializing
    })

    ipcMain.handle(ipcEvents.GET_CONNECTED_SERVERS, () => {
      return this.mcpHub.connections.map((item) => {
        const { server } = item
        const { name, config, tools = [], status } = server

        return { name, config, tools, status }
      })
    })

    ipcMain.handle(ipcEvents.GET_ALL_ABAILABLE_TOOLS, () => {
      return this.mcpHub.getAllAvailableToolsList()
    })

    ipcMain.handle(ipcEvents.CALL_TOOL, (_, serverName: string, toolName: string, toolArguments?: Record<string, unknown>) => {
      logger.debug(ipcEvents.CALL_TOOL, serverName, toolName, toolArguments)
      return this.mcpHub.callTool(serverName, toolName, toolArguments)
    })

    ipcMain.handle(ipcEvents.CONNECT_MCP_SERVER, async (_, name: string, mcpConfig: McpServerConfig) => {
      logger.debug(ipcEvents.CONNECT_MCP_SERVER, name, JSON.stringify(mcpConfig))
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
      return [ok, msg]
    })

    ipcMain.handle(ipcEvents.DISCONNECT_MCP_SERVER, async (_, name: string) => {
      logger.debug(ipcEvents.DISCONNECT_MCP_SERVER, name)
      return await this.mcpHub.deleteConnection(name)
    })

    ipcMain.handle(ipcEvents.RECONNECT_MCP_SERVER, async (_, name: string, mcpConfig: McpServerConfig) => {
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

      return [ok, msg]
    })

    ipcMain.handle(ipcEvents.FETCH_MCP_SERVER_TOOLS, (_, name: string) => {
      return this.mcpHub.fetchToolsList(name)
    })

    ipcMain.handle(ipcEvents.MCP_TOGGLE, (_, isEnable: boolean, mcpConfig?: McpSettings) => {
      logger.debug(ipcEvents.MCP_TOGGLE, isEnable, mcpConfig)
      if (isEnable && mcpConfig) {
        this.mcpHub.initializeMcpServers(mcpConfig)
      }

      if (!isEnable) {
        this.mcpHub.connections
          .map(item => item.server.name)
          .forEach((name) => {
            this.mcpHub.deleteConnection(name)
          })
      }
    })
  }
}
