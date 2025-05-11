import type { NotificationOption } from '@ant-chat/shared'
import { useThemeStore } from '@/store/theme'
import { ipcEvents } from '@ant-chat/shared'
import { App, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { RunnerCodeProvider } from './components/RunnerCode'
import { SliderMenu } from './components/SiliderMenu'
import { onMcpServerStatusChanged } from './store/mcpConfigs'

function AppWrapper() {
  const currentThemeMode = useThemeStore(state => state.mode)
  const currentTheme = useThemeStore(state => state.theme)
  const toggleTheme = useThemeStore(state => state.toggleTheme)

  const algorithm = currentTheme === 'dark'
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm

  /**
   * 添加浏览器主题变化监听
   */
  useEffect(() => {
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      if (currentThemeMode === 'auto') {
        const theme = e.matches ? 'light' : 'dark'
        toggleTheme(theme)
      }
    }

    // 同步设置下tailwindcss的暗黑模式
    document.documentElement.classList.toggle('dark', currentTheme === 'dark')

    const themeMedia = window.matchMedia('(prefers-color-scheme: light)')
    handleThemeChange(themeMedia)

    themeMedia.addEventListener('change', handleThemeChange)

    return () => {
      themeMedia.removeEventListener('change', handleThemeChange)
    }
  }, [toggleTheme])

  return (
    <ConfigProvider locale={zhCN} theme={{ algorithm, cssVar: { key: 'antd-css-var' }, hashed: false }}>
      <RunnerCodeProvider>
        <App className="h-full">
          <AntChatApp />
        </App>
      </RunnerCodeProvider>
    </ConfigProvider>
  )
}

function AntChatApp() {
  const { notification } = App.useApp()
  /**
   * 监听来自主线程的`notification` 事件
   */
  useEffect(() => {
    const handle = (_: Electron.IpcRendererEvent, { type, message, description }: NotificationOption) => {
      const func = notification[type]
      func({ message, description })
    }

    window.electronAPI.ipcRenderer.on(ipcEvents.NOTIFICATION, handle)
    window.electronAPI.ipcRenderer.on(ipcEvents.MCP_SERVER_STATUS_CHANGED, onMcpServerStatusChanged)

    return () => {
      window.electronAPI.ipcRenderer.removeAllListeners(ipcEvents.NOTIFICATION)
      window.electronAPI.ipcRenderer.removeAllListeners(ipcEvents.MCP_SERVER_STATUS_CHANGED)
    }
  }, [])

  return (
    <div className="w-full h-full bg-white dark:bg-black">
      <div className="grid h-full w-full grid-cols-[max-content_1fr]">
        <SliderMenu />
        <Outlet />
      </div>
    </div>
  )
}

export default AppWrapper
