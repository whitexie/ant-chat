import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'
import Header from '@/components/Header'
import { ActiveConversationIdProvider } from '@/contexts/ActiveConversationId'
import useModelConfig from '@/hooks/useModelConfig'
import { ConversationsProvider } from '@/stores/conversations'
import { App, ConfigProvider, Layout, theme } from 'antd'
import { useTheme } from './contexts/theme'

function AntChatApp() {
  const [currentTheme] = useTheme()
  useModelConfig()

  const algorithm = currentTheme === 'dark'
    ? theme.darkAlgorithm
    : theme.defaultAlgorithm

  return (
    <ConfigProvider theme={{ algorithm, cssVar: true, hashed: false }}>
      <App>
        <ActiveConversationIdProvider>
          <ConversationsProvider>
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
          </ConversationsProvider>
        </ActiveConversationIdProvider>
      </App>
    </ConfigProvider>
  )
}

export default AntChatApp
