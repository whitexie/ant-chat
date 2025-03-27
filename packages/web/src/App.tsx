import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'
import { useThemeStore } from '@/store/theme'
import { App, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useState } from 'react'
import { Logo } from './components/Logo'
import { RunnerCodeProvider } from './components/RunnerCode'
import { useMessagesStore } from './store/messages'

function AntChatApp() {
  const currentTheme = useThemeStore(state => state.theme)
  const [showSidebar, setShowSidebar] = useState(false)
  const activeConversationsId = useMessagesStore(state => state.activeConversationsId)
  const toggleTheme = useThemeStore(state => state.toggleTheme)

  const algorithm = currentTheme === 'dark'
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm

  useEffect(() => {
    if (activeConversationsId) {
      setShowSidebar(false)
    }
  }, [activeConversationsId])

  useEffect(() => {
    const handleThemeChange = (e: MediaQueryListEvent | MediaQueryList) => {
      const theme = e.matches ? 'default' : 'dark'
      toggleTheme(theme)
    }

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
        <App>
          <div className="w-full h-full bg-white dark:bg-black">
            <div className="grid h-full w-full grid-cols-[0px_1fr] md:grid-cols-[var(--conversationWidth)_1fr]">
              <div className="md:(border-r-solid border-black/10 dark:border-white/40) border-r-1px  overflow-hidden h-0  md:(block h-full)">
                <div className="fixed border-b-solid bg-[var(--ant-layout-body-bg)] border-b-1px border-black/10 dark:border-white/40 w-full top-0 left-0 z-10 md:(relative) h-50px flex justify-center items-center">
                  <Logo show={showSidebar} onChange={setShowSidebar} />
                </div>
                <div className={`h-[var(--mainHeight)] w-50vw md:w-full ${showSidebar ? 'absolute z-20 top-[var(--headerHeight)] left-0' : ''}`}>
                  {
                    /* 遮罩， 只在移动端显示 */
                    showSidebar && (
                      <div className="mask fixed top-[var(--headerHeight)] left-0 right-0 bottom-0 bg-black/50 dark:bg-white/10 z-10" onClick={() => setShowSidebar(false)} />
                    )
                  }
                  <div className="h-full relative z-20 bg-[var(--ant-layout-color-bg-body)] md:bg-unset">
                    <ConversationsManage />
                  </div>
                </div>
              </div>
              <div className="relative transition-all flex h-[var(--mainHeight)] mt-[50px] md:(mt-0 h-full)">
                <Chat />
              </div>
            </div>
          </div>
        </App>
      </RunnerCodeProvider>
    </ConfigProvider>
  )
}

export default AntChatApp
