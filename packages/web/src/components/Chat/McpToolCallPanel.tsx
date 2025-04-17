import type { IMcpToolCall } from '@/db/interface'
import { LoadingOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { Button, Collapse, Descriptions, Tag } from 'antd'

interface McpToolCallPanelProps {
  item: IMcpToolCall
  onExecute?: (item: IMcpToolCall) => void
}

export function McpToolCallPanel({ item, onExecute }: McpToolCallPanelProps) {
  function getMcpExecuteStateElement() {
    if (item.executeState === 'await') {
      return (
        <Button
          size="small"
          type="primary"
          icon={<PlayCircleOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            onExecute?.(item)
          }}
        >
          执行
        </Button>
      )
    }
    else if (item.executeState === 'executing') {
      return <LoadingOutlined spin />
    }
    else if (item.executeState === 'completed' && item.result?.success) {
      return <Tag color="green">执行成功</Tag>
    }
    else if (item.executeState === 'completed' && !item.result?.success) {
      return <Tag color="red">执行失败</Tag>
    }
  }

  return (
    <Collapse
      key={item.id}
      size="small"
      defaultActiveKey={['mcp']}
      items={[
        {
          key: 'mcp',
          label: (
            <div className="flex justify-between w-full">
              <div className="flex items-center">
                MCP：
                <Tag color="blue">{item.serverName}</Tag>
                {/* <Divider type="vertical" /> */}
                <Tag color="green">{item.toolName}</Tag>
              </div>
              <div className="ml-5">
                {getMcpExecuteStateElement()}
              </div>
            </div>
          ),
          children: (
            <Descriptions
              items={[
                {
                  key: 'arguments',
                  label: '执行参数',
                  span: 'filled',
                  children: (
                    <div className="whitespace-pre-wrap">
                      {JSON.stringify(item.args, null, 2)}
                    </div>
                  ),
                },
                {
                  key: 'result',
                  label: '执行结果',
                  span: 'filled',
                  children: (
                    <div className={`whitespace-pre-wrap ${!item.result?.success && 'text-red-500'}`}>
                      {
                        item.result?.success
                          ? item.result?.data
                          : item.result?.error
                      }
                    </div>

                  ),
                },
              ]}
            />

          ),
        },
      ]}
    />
  )
}
