import AntChatApp from '@/App'
import { ChatPage } from '@/pages/Chat'
import SettingsPage from '@/pages/Settings'
import {
  createBrowserRouter,
} from 'react-router'

const router = createBrowserRouter([
  {
    path: '/',
    Component: AntChatApp,
    children: [
      {
        path: 'chat',
        Component: ChatPage,
      },
      {
        path: 'settings',
        Component: SettingsPage,
      },
    ],
  },

])

export default router
