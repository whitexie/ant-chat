import type { McpConfig } from '@/db/interface'
import { getNow } from '@/utils'
import { Alert, Button } from 'antd'
import TextArea from 'antd/es/input/TextArea'
import React from 'react'

interface QuickImportProps {
  onImport?: (e: McpConfig) => void
}

export function QuickImport({ onImport }: QuickImportProps) {
  const [quickImport, setQuickImport] = React.useState(false)
  const [text, setText] = React.useState('')
  const [error, setError] = React.useState('')

  const placeholder = `
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        "/Users/ysansan"
      ]
    }
  }
}
`

  return quickImport
    ? (
        <div>
          {
            error.length > 0 && (
              <Alert type="error" message={error} showIcon className="mb-2" />
            )
          }
          <TextArea
            value={text}
            onChange={(e) => {
              setText(e.target.value)
            }}
            autoSize={{ minRows: 10, maxRows: 10 }}
            placeholder={placeholder.trim()}
            onFocus={() => {
              setError('')
            }}
          />
          <div className="flex items-center mt-1 gap-1 justify-end">
            <Button size="small" onClick={() => setQuickImport(false)}>取消</Button>
            <Button
              size="small"
              type="primary"
              onClick={() => {
                if (!text.length) {
                  setError('输入内容不能为空')
                  return
                }
                try {
                  const mcpConfig = parseMcpServerJsonText(text)
                  onImport?.(mcpConfig)
                  setText('')
                  setQuickImport(false)
                }
                catch (e) {
                  setError((e as Error).message)
                }
              }}
            >
              导入
            </Button>
          </div>
        </div>
      )
    : (
        <Button
          block
          color="default"
          variant="dashed"
          style={{ paddingTop: '5px', paddingBottom: '5px' }}
          onClick={() => {
            setQuickImport(true)
          }}
        >
          快速导入JSON配置
        </Button>
      )
}

interface ServerJson {
  mcpServers: {
    [key: string]: {
      transportType?: 'sse' | 'stdio'
      command?: string
      args?: string[]
      env?: Record<string, string | number | boolean>
      url?: string
    }
  }
}

function parseMcpServerJsonText(text: string): McpConfig {
  const data = JSON.parse(text) as ServerJson
  if (typeof data.mcpServers !== 'object') {
    throw new TypeError('mcpServers 格式错误')
  }
  const entries = Object.entries(data.mcpServers)

  if (entries.length === 0) {
    throw new Error('mcpServers 为空')
  }

  const [serverName, config] = entries[0]

  if (config.command && config.args) {
    return {
      transportType: 'stdio',
      serverName,
      command: config.command,
      args: config.args,
      env: config.env || {},
      createAt: getNow(),
      updateAt: getNow(),
    }
  }
  else if (config.url) {
    return {
      transportType: 'sse' as const,
      serverName,
      url: config.url,
      createAt: getNow(),
      updateAt: getNow(),
    }
  }

  throw new Error('未知的服务器配置')
}
