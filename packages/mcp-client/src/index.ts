import type { Tool } from '@modelcontextprotocol/sdk/types.js'
import type { McpServer } from './types/mcp'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { Client } from '@modelcontextprotocol/sdk/client/index.js'
import { SSEClientTransport } from '@modelcontextprotocol/sdk/client/sse.js'
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js'
import { CallToolResultSchema, ListToolsResultSchema } from '@modelcontextprotocol/sdk/types.js'
import deepEqual from 'fast-deep-equal'
import z from 'zod'
import * as packageJson from '../package.json'

export type McpServerConfig = z.infer<typeof ServerConfigSchema>

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

const DEFAULT_REQUEST_TIMEOUT_MS = 5000
const DEFAULT_MCP_TIMEOUT_SECONDS = 30

const BaseConfigSchema = z.object({
  disabled: z.boolean().optional(),
  timeout: z.number().min(DEFAULT_REQUEST_TIMEOUT_MS).optional().default(DEFAULT_REQUEST_TIMEOUT_MS),
})

const SseConfigSchema = BaseConfigSchema.extend({
  url: z.string().url(),
}).transform(config => ({
  ...config,
  transportType: 'sse' as const,
}))

const StdioConfigSchema = BaseConfigSchema.extend({
  command: z.string(),
  args: z.array(z.string()).optional(),
  env: z.record(z.string()).optional(),
}).transform(config => ({
  ...config,
  transportType: 'stdio' as const,
}))

const ServerConfigSchema = z.union([StdioConfigSchema, SseConfigSchema])

const McpSettingsSchema = z.object({
  mcpServers: z.record(ServerConfigSchema),
})

export type ITool = Pick<Tool, 'name' | 'description' | 'inputSchema'> & {
  serverName: string
}

export interface McpConnection {
  server: McpServer
  client: Client
  transport: StdioClientTransport | SSEClientTransport
}

export class MCPClientHub {
  isInitializing = false
  connections: McpConnection[] = []

  constructor() {
    this.initializeMcpServers()
  }

  private async initializeMcpServers(): Promise<void> {
    this.isInitializing = true
    const settings = await this.readAndValidateMcpSettingsFile()
    if (settings) {
      await this.updateServerConnections(settings.mcpServers)
    }
    this.isInitializing = false
  }

  async readAndValidateMcpSettingsFile(): Promise<z.infer<typeof McpSettingsSchema> | undefined> {
    const mcpFilePath = this.getMcpSettingsFilePath()
    const mcpSettingsContent = await fs.readFile(mcpFilePath, 'utf-8')

    const result = McpSettingsSchema.safeParse(JSON.parse(mcpSettingsContent))

    if (!result.success) {
      console.error(result.error)
      throw new Error('Invalid MCP settings format. Please ensure your settings follow the correct JSON format.')
    }

    return result.data
  }

  async updateServerConnections(newServers: Record<string, McpServerConfig>): Promise<void> {
    // this.removeAllFileWatchers()
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
          if (config.transportType === 'stdio') {
            // this.setupFileWatcher(name, config)
          }
          await this.deleteConnection(name)
          await this.connectToServer(name, config)
          console.log(`Reconnected MCP server with updated config: ${name}`)
        }
        catch (error) {
          console.error(`Failed to reconnect MCP server ${name}:`, error)
        }
      }
      // If server exists with same config, do nothing
    }
    // await this.notifyWebviewOfServerChanges()
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
    connection.server.tools = await this.fetchToolsList(name)
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

      return response.tools || []
    }
    catch {
      return []
    }
  }

  async callTool(serverName: string, toolName: string, toolArguments?: Record<string, unknown>): Promise<McpToolCallResponse> {
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
      }
    }
  }

  getMcpSettingsFilePath() {
    const userHomeDir = os.homedir()
    return path.join(userHomeDir, './.ant-chat/mcp-settings.json')
  }
}

function secondsToMs(seconds: number) {
  return seconds * 1000
}
