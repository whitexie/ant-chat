import {
  createHashRouter,
  Navigate,
} from 'react-router'
import AntChatApp from '@/App'
import { ChatPage } from '@/pages/Chat'
import MCPManage from '@/pages/Settings/MCPManage'
import ProviderManage from '@/pages/Settings/ProviderManage'
import SettingsPage from '@/pages/Settings/Settings'

const router = createHashRouter([
  {
    path: '/',
    Component: AntChatApp,
    children: [
      {
        index: true, // 代表 / 路径
        element: <Navigate to="/chat" replace />,
      },
      {
        path: 'chat',
        Component: ChatPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
        children: [
          { index: true, element: <Navigate to="./provider" replace /> },
          { path: 'provider', Component: ProviderManage },
          { path: 'mcp', Component: MCPManage },
        ],
      },
    ],
  },

])

export default router
