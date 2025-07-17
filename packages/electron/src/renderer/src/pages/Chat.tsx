import React from 'react'
import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'
import { SearchContainer } from '@/components/Search'
import { ChatSettingsProvider } from '@/contexts/chatSettings'

export function ChatPage() {
  const [openModal, setOpenModal] = React.useState(false)

  React.useEffect(
    () => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
          e.preventDefault()
          setOpenModal(!openModal)
        }

        if (e.key === 'Escape' && openModal) {
          e.preventDefault()
          setOpenModal(false)
        }
      }

      window.addEventListener('keydown', handleKeyDown)

      return () => {
        window.removeEventListener('keydown', handleKeyDown)
      }
    },
  )

  return (
    <div className="flex">
      <div className="border-solid w-60 border-(--border-color) overflow-hidden border-r-1 h-[100dvh]">
        <div className="h-full relative">
          <ConversationsManage />
        </div>
      </div>
      <div className="relative flex-1 flex h-(--mainHeight) transition-all">
        <ChatSettingsProvider>
          <Chat />
        </ChatSettingsProvider>
      </div>
      <SearchContainer />
    </div>
  )
}
