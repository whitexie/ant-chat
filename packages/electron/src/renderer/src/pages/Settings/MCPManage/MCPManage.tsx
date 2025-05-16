import type { McpConfigSchema } from '@ant-chat/shared'
import { useMcpStore } from '@/store/features'
import { addMcpConfigAction, connectMcpServerAction, deleteMcpConfigAction, disconnectMcpServerAction, initializeMcpConfigs, reconnectMcpServerAction, upadteMcpConfigAction, useMcpConfigsStore } from '@/store/mcpConfigs'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Empty, Switch } from 'antd'
import React from 'react'
import { MCPList } from './MCPList'

const McpConfigDrawer = React.lazy(() => import('@/components/MCPManage/McpConfigDrawer'))

export default function MCPManage() {
  const [open, setOpen] = React.useState(false)
  const [mode, setMode] = React.useState<'add' | 'edit'>('add')
  const [editData, setEditData] = React.useState<McpConfigSchema | null>(null)
  const { message } = App.useApp()
  // const { data, refreshAsync } = useRequest(getAllMcpConfigs)
  const data = useMcpConfigsStore(state => state.mcpConfigs)
  const mcpServerRuningStatusMap = useMcpConfigsStore(state => state.mcpServerRuningStatusMap)
  const { enableMCP, setEnableMCP } = useMcpStore()
  const refreshAsync = initializeMcpConfigs

  React.useEffect(() => {
    initializeMcpConfigs()
  }, [])

  return (
    <div className="p-2">
      <div className="flex justify-between border border-solid dark:border-white/20 border-black/10 rounded-xl p-4 mb-4">
        <div>
          启用MCP功能
        </div>
        <div>
          <Switch value={enableMCP} onChange={setEnableMCP} />
        </div>
      </div>
      {
        enableMCP
          ? (
              <>
                <div className="">
                  <Button
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setMode('add')
                      setOpen(true)
                    }}
                  >
                    添加服务器
                  </Button>
                  <MCPList
                    items={data}
                    onTriggerAction={async (action, item) => {
                      switch (action) {
                        case 'delete': {
                          if (mcpServerRuningStatusMap[item.serverName] === 'connected') {
                            await disconnectMcpServerAction(item.serverName)
                          }
                          await deleteMcpConfigAction(item.serverName)
                          break
                        }

                        case 'start':
                          await connectMcpServerAction(item.serverName)
                          break
                        case 'stop':
                          await disconnectMcpServerAction(item.serverName)
                          break
                        case 'edit':
                          setEditData(item)
                          setMode('edit')
                          setOpen(true)
                          break
                        default:
                          break
                      }
                      // 这里需要判断是否是编辑操作，如果不是编辑操作，则需要刷新列表
                      if (action !== 'edit') {
                        await refreshAsync()
                      }
                    }}
                  />
                </div>
                <React.Suspense>
                  <McpConfigDrawer
                    key={editData?.serverName || mode}
                    open={open}
                    mode={mode}
                    defaultValues={mode === 'edit' && editData ? editData : undefined}
                    onClose={() => {
                      setOpen(false)
                    }}
                    onSave={async (e) => {
                      if (mode === 'add') {
                        const [ok, msg] = await addMcpConfigAction(e)
                        if (ok) {
                          setOpen(false)
                          await refreshAsync()
                        }
                        else {
                          message.error(msg)
                        }
                        return
                      }

                      // 如果修改了名称，需要先删掉数据重新添加
                      if (editData?.serverName && editData?.serverName !== e.serverName) {
                        await deleteMcpConfigAction(editData.serverName)
                        await disconnectMcpServerAction(editData.serverName)
                        await addMcpConfigAction(e)

                        if (mcpServerRuningStatusMap[editData?.serverName] === 'connected') {
                          await connectMcpServerAction(e.serverName)
                        }
                      }
                      else {
                        await upadteMcpConfigAction(structuredClone(e))
                        // 如果修改了 transportType、url、 command、args、env 参数，需要重新连接
                        if (checkNeedReconnect(editData as McpConfigSchema, e)) {
                          await reconnectMcpServerAction(e.serverName)
                        }
                      }
                      setOpen(false)
                      await refreshAsync()
                    }}
                  />
                </React.Suspense>
              </>
            )
          : (
              <Empty
                image={null}
                styles={{ image: { height: 0, width: 0 } }}
                description="请先启用MCP以访问配置选项"
              />
            )
      }
    </div>
  )
}

function checkNeedReconnect(oldConfig: McpConfigSchema, newConfig: McpConfigSchema): boolean {
  // Compare specific fields that require a reconnect if changed
  const fieldsToCheck = ['transportType', 'url', 'command', 'args', 'env'] as (keyof McpConfigSchema)[]

  return fieldsToCheck.some((field) => {
    if (Array.isArray(oldConfig[field as keyof McpConfigSchema]) && Array.isArray(newConfig[field as keyof McpConfigSchema])) {
      // Deep comparison for arrays
      return JSON.stringify(oldConfig[field]) !== JSON.stringify(newConfig[field])
    }
    return oldConfig[field] !== newConfig[field]
  })
}
