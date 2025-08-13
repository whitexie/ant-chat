import type { NotificationOption } from '@ant-chat/shared'
import { App } from 'antd'
import { useEffect } from 'react'
import { onMcpServerStatusChanged } from '@/store/mcpConfigs/action'
import { updateMessageActionV2 } from '@/store/messages'
import { ipc } from '@/utils/ipc-bus'

export function useIpcEventListener() {
  const { notification } = App.useApp()

  useEffect(() => {
    const handle = (_: Electron.IpcRendererEvent, { type, message, description }: NotificationOption) => {
      const func = notification[type]
      func({ message, description })
    }

    ipc.on('common:Notification', handle)
    ipc.on('mcp:McpServerStatusChanged', onMcpServerStatusChanged)
    ipc.on('chat:stream-message', (_, msg) => {
      console.log('chat:stream-message => ', msg)
      updateMessageActionV2(msg)
    })

    return () => {
      window.electron.ipcRenderer.removeAllListeners('common:Notification')
      window.electron.ipcRenderer.removeAllListeners('mcp:McpServerStatusChanged')
      window.electron.ipcRenderer.removeAllListeners('chat:stream-message')
    }
  }, [])
}
