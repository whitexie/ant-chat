import { addMcpConfig } from '@/db/mcpConfigActions'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button } from 'antd'
import React from 'react'

const McpConfigDrawer = React.lazy(() => import('@/components/MCPManage/McpConfigDrawer'))

export default function MCPManage() {
  const [open, setOpen] = React.useState(false)
  const { message } = App.useApp()

  return (
    <div className="p-2">
      <div>
        <div>
          <Button
            icon={<PlusOutlined />}
            onClick={() => {
              setOpen(true)
            }}
          >
            添加服务器
          </Button>
        </div>
        <div>
        </div>
      </div>
      <React.Suspense>
        <McpConfigDrawer
          open={open}
          onClose={() => {
            setOpen(false)
          }}
          onSave={async (e) => {
            const [ok, msg] = await addMcpConfig(e)
            if (ok) {
              setOpen(false)
            }
            else {
              message.error(msg)
            }
          }}
        />
      </React.Suspense>
    </div>
  )
}
