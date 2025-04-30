import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'

export function ChatPage() {
  return (
    <>
      <div className="border-r-solid border-black/3 dark:border-white/20 border-r-1px  overflow-hidden h-100dvh">
        <div className="h-full relative">
          <ConversationsManage />
        </div>
      </div>
      <div className="relative transition-all flex h-[var(--mainHeight)]">
        <Chat />
      </div>
    </>
  )
}
