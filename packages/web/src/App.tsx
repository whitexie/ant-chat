import { useThemeStore } from '@/store/theme'
import { App, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect } from 'react'
import { Outlet } from 'react-router'
import { RunnerCodeProvider } from './components/RunnerCode'
import { SliderMenu } from './components/SiliderMenu'

function AntChatApp() {
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

    // 同步设置下UnoCSS的暗黑模式
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
          <div className="w-full h-full bg-white dark:bg-black">
            <div className="grid h-full w-full grid-cols-[60px_var(--conversationWidth)_1fr]">
              <SliderMenu />
              <Outlet />
            </div>
          </div>
        </App>
      </RunnerCodeProvider>
    </ConfigProvider>
  )
}

export default AntChatApp
