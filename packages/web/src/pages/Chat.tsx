import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'

export function ChatPage() {
  return (
    <>
      <div className="border-r-solid dark:border-white/20 overflow-hidden border-black/3 border-r-1px h-100dvh">
        <div className="h-full relative">
          <ConversationsManage />
        </div>
      </div>
      <div className="relative flex h-[var(--mainHeight)] transition-all">
        <Chat />
      </div>
    </>
  )
}
