import type { McpServerConfig } from '@ant-chat/mcp-client-hub'
import { MCPClientHub } from '@ant-chat/mcp-client-hub'
import { ipcEvents } from '@ant-chat/shared'
import { ipcMain } from 'electron'

export class McpService {
  private readonly mcpHub: MCPClientHub

  constructor() {
    this.mcpHub = new MCPClientHub()
  }

  registerEvent() {
    ipcMain.handle(ipcEvents.GET_MCP_INITIALIZE_STATE, () => {
      return this.mcpHub.isInitializing
    })

    ipcMain.handle(ipcEvents.GET_CONNECTED_SERVERS, () => {
      return this.mcpHub.connections.map((item) => {
        const { server } = item
        const { name, config, tools = [] } = server

        return { name, config, tools }
      })
    })

    ipcMain.handle(ipcEvents.GET_ALL_ABAILABLE_TOOLS, () => {
      return this.mcpHub.getAllAvailableToolsList()
    })

    ipcMain.handle(ipcEvents.CALL_TOOL, (_, serverName: string, toolName: string, toolArguments?: Record<string, unknown>) => {
      console.log('mcp:callTool start execute', serverName, toolName, toolArguments)
      return this.mcpHub.callTool(serverName, toolName, toolArguments)
    })

    ipcMain.handle(ipcEvents.CONNECT_MCP_SERVER, (_, name: string, mcpConfig: McpServerConfig) => {
      console.log(ipcEvents.CONNECT_MCP_SERVER, name, JSON.stringify(mcpConfig))
      return this.mcpHub.connectToServer(name, mcpConfig)
    })

    ipcMain.handle(ipcEvents.FETCH_MCP_SERVER_TOOLS, (_, name: string) => {
      return this.mcpHub.fetchToolsList(name)
    })
  }
}
