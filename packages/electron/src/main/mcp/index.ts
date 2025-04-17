import { MCPClientHub } from '@ant-chat/mcp-client-hub'
import { ipcMain } from 'electron'

export class McpService {
  private readonly mcpHub: MCPClientHub

  constructor() {
    this.mcpHub = new MCPClientHub()
  }

  registerEvent() {
    ipcMain.handle('mcp:getInitializeState', () => {
      return this.mcpHub.isInitializing
    })

    ipcMain.handle('mcp:getConnections', () => {
      return this.mcpHub.connections.map((item) => {
        const { server } = item
        const { name, config, tools = [] } = server

        return { name, config, tools }
      })
    })

    ipcMain.handle('mcp:getAllAvailableToolsList', () => {
      return this.mcpHub.getAllAvailableToolsList()
    })

    ipcMain.handle('mcp:callTool', (_, serverName: string, toolName: string, toolArguments?: Record<string, unknown>) => {
      console.log('mcp:callTool start execute', serverName, toolName, toolArguments)
      return this.mcpHub.callTool(serverName, toolName, toolArguments)
    })
  }
}
