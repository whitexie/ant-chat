import type { McpServer, McpTool } from '@ant-chat/shared'
import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { z } from 'zod'
import type { McpServerConfig, McpSettingsSchema } from './schema'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { DEFAULT_MCP_TOOL_NAME_SEPARATOR } from '@ant-chat/shared'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js'
import deepEqual from 'fast-deep-equal'
import * as packageJson from '../package.json'
import { DEFAULT_MCP_TIMEOUT_SECONDS, DEFAULT_REQUEST_TIMEOUT_MS, ServerConfigSchema } from './schema'

export interface McpToolCallResponse {
  _meta?: Record<string, any>
  content: Array<
    | {
      type: 'text'
      text: string
    }
    | {
      type: 'image'
      data: string
      mimeType: string
    }
    | {
      type: 'resource'
      resource: {
        uri: string
        mimeType?: string
        text?: string
        blob?: string
      }
    }
  >
  isError?: boolean
}

export type ITool = Pick<Tool, 'name' | 'description' | 'inputSchema'> & {
  serverName: string
}

export interface McpConnection {
  server: McpServer
  client: Client
  transport: StdioClientTransport | SSEClientTransport
}

/**
 * 这个类的实现参考自：https://github.com/cline/cline/blob/main/src/services/mcp/McpHub.ts
 */
export class MCPClientHub {
  isInitializing = false
  connections: McpConnection[] = []
  private onErrorCallbacks: ((name: string, e: Error) => void)[] = []

  addErrorCallback(callback: (name: string, e: Error) => void) {
    if (typeof callback === 'function') {
      this.onErrorCallbacks.push(callback)
    }
  }

  removeErrorCallback(callback: (name: string, e: Error) => void) {
    const index = this.onErrorCallbacks.findIndex(func => func === callback)
    if (index > -1) {
      this.onErrorCallbacks.splice(index, 1)
    }
  }

  async initializeMcpServers(settings: z.infer<typeof McpSettingsSchema>): Promise<void> {
    this.isInitializing = true
    if (settings) {
      await this.updateServerConnections(settings.mcpServers)
    }
    this.isInitializing = false
  }

  async updateServerConnections(newServers: Record<string, McpServerConfig>): Promise<void> {
    const currentNames = new Set(this.connections.map(conn => conn.server.name))
    const newNames = new Set(Object.keys(newServers))

    // Delete removed servers
    for (const name of currentNames) {
      if (!newNames.has(name)) {
        await this.deleteConnection(name)
        console.log(`Deleted MCP server: ${name}`)
      }
    }

    // Update or add servers
    for (const [name, config] of Object.entries(newServers)) {
      if (config.disabled) {
        continue
      }

      const currentConnection = this.connections.find(conn => conn.server.name === name)

      if (!currentConnection) {
        // New server
        try {
          if (config.transportType === 'stdio') {
            // this.setupFileWatcher(name, config)
          }
          await this.connectToServer(name, config)
        }
        catch (error) {
          console.error(`Failed to connect to new MCP server ${name}:`, error)
        }
      }
      else if (!deepEqual(JSON.parse(currentConnection.server.config), config)) {
        // Existing server with changed config
        try {
          await this.deleteConnection(name)
          await this.connectToServer(name, config)
          console.log(`Reconnected MCP server with updated config: ${name}`)
        }
        catch (error) {
          console.error(`Failed to reconnect MCP server ${name}:`, error)
        }
      }
    }
  }

  async connectToServer(name: string, config: McpServerConfig) {
    this.connections = this.connections.filter(conn => conn.server.name !== name)

    const client = new Client({ name: packageJson.name, version: packageJson.version })

    let transport: StdioClientTransport | SSEClientTransport

    if (config.transportType === 'sse') {
      transport = new SSEClientTransport(new URL(config.url), {})
    }
    else {
      transport = new StdioClientTransport({
        command: config.command,
        args: config.args,
        env: {
          ...config.env,
          ...(process.env.PATH ? { PATH: process.env.PATH } : {}),
        },
      })
    }

    // 设置回调
    transport.onerror = async (error) => {
      console.error(`Transport error for "${name}":`, error)
      this.onErrorCallbacks.forEach((func) => {
        func(name, error)
      })
      const connection = this.connections.find(conn => conn.server.name === name)
      if (connection) {
        connection.server.status = 'disconnected'
      }
    }

    transport.onclose = async () => {
      console.error(`Transport closed for "${name}."`)
      const connection = this.connections.find(conn => conn.server.name === name)
      if (connection) {
        connection.server.status = 'disconnected'
      }
    }

    const connection: McpConnection = {
      server: {
        name,
        config: JSON.stringify(config),
        status: 'connecting',
        disabled: config.disabled,
      },
      client,
      transport,
    }

    this.connections.push(connection)

    await connection.client.connect(transport)
    connection.server.status = 'connected'
    connection.server.error = ''

    // 获取tools列表
    connection.server.tools = (await this.fetchToolsList(name)) || []

    return true
  }

  async fetchToolsList(name: string) {
    try {
      const connect = this.connections.find(item => item.server.name === name)
      if (!connect) {
        throw new Error(`MCP server "${name}" not found.`)
      }

      const response = await connect.client.request({ method: 'tools/list' }, ListToolsResultSchema, {
        timeout: DEFAULT_REQUEST_TIMEOUT_MS,
      })

      return (response.tools || []).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: (tool.inputSchema.properties || {}) as Record<string, Record<string, unknown>>,
          required: tool.inputSchema.required,
        },
      })) as McpTool[]
    }
    catch {
      return []
    }
  }

  getAllAvailableToolsList(): McpTool[] {
    const tools: McpTool[] = []
    this.connections.filter(item => item.server.status === 'connected').forEach((item) => {
      if (item.server.tools) {
        tools.push(
          ...item.server.tools.map((tool) => {
            const { name, description, inputSchema } = tool
            // const { type = 'object', properties = {}, required = [] } = inputSchema
            return {
              name: `${item.server.name}${DEFAULT_MCP_TOOL_NAME_SEPARATOR}${name}`,
              description,
              inputSchema,
            }
          }),
        )
      }
    })

    return tools
  }

  async callTool(serverName: string, toolName: string, toolArguments?: Record<string, unknown>) {
    const connection = this.connections.find(conn => conn.server.name === serverName)
    if (!connection) {
      throw new Error(
        `No connection found for server: ${serverName}. Please make sure to use MCP servers available under 'Connected MCP Servers'.`,
      )
    }

    if (connection.server.disabled) {
      throw new Error(`Server "${serverName}" is disabled and cannot be used`)
    }

    let timeout = secondsToMs(DEFAULT_MCP_TIMEOUT_SECONDS) // sdk expects ms

    try {
      const config = JSON.parse(connection.server.config)
      const parsedConfig = ServerConfigSchema.parse(config)
      timeout = secondsToMs(parsedConfig.timeout)
    }
    catch (error) {
      console.error(`Failed to parse timeout configuration for server ${serverName}: ${error}`)
    }

    return await connection.client.request(
      {
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: toolArguments,
        },
      },
      CallToolResultSchema,
      {
        timeout,
      },
    )
  }

  async deleteConnection(name: string) {
    const index = this.connections.findIndex(item => item.server.name === name)
    if (index !== -1) {
      const connection = this.connections[index]
      this.connections.splice(index, 1)

      try {
        await connection.transport.close()
        await connection.client.close()
      }
      catch (error) {
        console.error(`Failed to close transport for ${name}:`, error)
        return false
      }
    }

    return true
  }

  getMcpSettingsFilePath() {
    const userHomeDir = os.homedir()
    return path.join(userHomeDir, './Documents/.ant-chat/mcp-settings.json')
  }
}

function secondsToMs(seconds: number) {
  return seconds * 1000
}
