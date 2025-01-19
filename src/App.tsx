import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'
import Header from '@/components/Header'
import { useThemeStore } from '@/store/theme'
import { App, ConfigProvider, Layout, theme } from 'antd'

function AntChatApp() {
  const currentTheme = useThemeStore(state => state.theme)

  const algorithm = currentTheme === 'dark'
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm

  return (
    <ConfigProvider theme={{ algorithm, cssVar: true, hashed: false }}>
      <App>
        <Layout>
          <div className="w-full h-full">
            <Header />
            <div className="grid w-full h-[var(--mainHeight)] grid-cols-[var(--conversationWidth)_1fr]">
              <div className="shadow h-full">
                <ConversationsManage />
              </div>
              <Chat />
            </div>
          </div>
        </Layout>
      </App>
    </ConfigProvider>
  )
}

export default AntChatApp
