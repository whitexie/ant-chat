import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'
import { useThemeStore } from '@/store/theme'
import { App, ConfigProvider, Layout, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'
import { Logo } from './components/Logo'

function AntChatApp() {
  const currentTheme = useThemeStore(state => state.theme)

  const algorithm = currentTheme === 'dark'
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm

  return (
    <ConfigProvider locale={zhCN} theme={{ algorithm, cssVar: true, hashed: false }}>
      <App>
        <Layout>
          <div className="w-full h-full">
            <div className="grid w-full grid-cols-[var(--conversationWidth)_1fr]">
              <div className="shadow">
                <div className="h-50px flex justify-center items-center">
                  <Logo />
                </div>
                <div className=" h-[var(--mainHeight)]">
                  <ConversationsManage />
                </div>
              </div>
              <div className="relative">
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
