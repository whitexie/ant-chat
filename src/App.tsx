import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'
import { useThemeStore } from '@/store/theme'
import { App, ConfigProvider, Layout, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { useEffect, useState } from 'react'
import { Logo } from './components/Logo'
import { useConversationsStore } from './store/conversation'

function AntChatApp() {
  const currentTheme = useThemeStore(state => state.theme)
  const [showSidebar, setShowSidebar] = useState(false)
  const activeConversationId = useConversationsStore(state => state.activeConversationId)

  const algorithm = currentTheme === 'dark'
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm

  useEffect(() => {
    if (activeConversationId) {
      setShowSidebar(false)
    }
  }, [activeConversationId])

  return (
    <ConfigProvider locale={zhCN} theme={{ algorithm, cssVar: true, hashed: false }}>
      <App>
        <Layout>
          <div className="w-full h-full">
            <div className="grid h-full w-full  grid-cols-[0px_1fr] md:grid-cols-[var(--conversationWidth)_1fr]">
              <div className="shadow overflow-hidden h-0  md:(block h-full)">
                <div className="absolute shadow w-full top-0 left-0 z-10 md:(relative) h-50px flex justify-center items-center">
                  <Logo show={showSidebar} onChange={setShowSidebar} />
                </div>
                <div className={`h-[var(--mainHeight)] w-50vw md:w-full ${showSidebar ? 'absolute z-20 top-[var(--headerHeight)] left-0' : ''}`}>
                  {
                    /* 遮罩， 只在移动端显示 */
                    showSidebar && (
                      <div className="mask fixed z-1 top-[var(--headerHeight)] left-0 right-0 bottom-0 bg-black/50 z-10" onClick={() => setShowSidebar(false)} />
                    )
                  }
                  <div className="relative z-20 bg-[var(--ant-layout-color-bg-body)] md:bg-unset">
                    <ConversationsManage />
                  </div>
                </div>
              </div>
              <div className="relative h-[var(--mainHeight)] mt-[50px] md:(mt-0 h-full)">
                <Chat />
              </div>
            </div>
          </div>
        </Layout>
      </App>
    </ConfigProvider>
  )
}

export default AntChatApp
