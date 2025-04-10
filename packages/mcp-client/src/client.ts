import type { MCPClientConfig } from './types'

export class MCPClient {
  private config: MCPClientConfig

  constructor(config: MCPClientConfig) {
    this.config = config
  }
}
