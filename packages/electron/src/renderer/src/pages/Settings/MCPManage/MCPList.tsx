import type { McpConfig } from '@/db/interface'
import type { McpConfigActionsProps } from './McpConfigActions'
import { useMcpConfigsStore } from '@/store/mcpConfigs'
import { LoadingOutlined } from '@ant-design/icons'
import { Tag } from 'antd'
import { McpConfigActions } from './McpConfigActions'

interface MCPListProps {
  items?: McpConfig[]
  onTriggerAction?: McpConfigActionsProps['onTriggerAction']
}

export function MCPList({ items, onTriggerAction }: MCPListProps) {
  const connectStatusMap = useMcpConfigsStore(state => state.mcpServerRuningStatusMap)

  return (
    <div className="pt-4 flex flex-col gap-4">
      {
        items?.map(item => (
          <div className="py-2 px-4 flex items-center justify-between border border-solid dark:border-white/20 border-black/10 rounded-xl" key={item.serverName}>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl">{item.icon}</span>
                <span>{item.serverName}</span>
                <span>
                  {getMcpServerRunStatus(connectStatusMap, item.serverName)}
                </span>
              </div>
              {
                item.description && <div className="pt-2 text-sm text-gray-400">{item.description}</div>
              }
            </div>
            <McpConfigActions
              item={item}
              status={connectStatusMap[item.serverName] || 'disconnected'}
              onTriggerAction={onTriggerAction}
            />
          </div>
        ))
      }
    </div>
  )
}

function getMcpServerRunStatus(statusMap: Record<string, 'connected' | 'connecting' | 'disconnected'>, name: string) {
  const status = statusMap[name] || 'disconnected'

  if (status === 'disconnected') {
    return <Tag color="#1f2937">已停止</Tag>
  }

  return status === 'connected' ? <Tag color="green-inverse">运行中</Tag> : <Tag icon={<LoadingOutlined spin />} color="red-inverse">启动中</Tag>
}
