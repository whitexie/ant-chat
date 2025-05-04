import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'

export function ChatPage() {
  return (
    <div className="flex">
      <div className="border-solid dark:border-white/20 overflow-hidden border-black/10 border-r-1 h-[100dvh]">
        <div className="h-full relative">
          <ConversationsManage />
        </div>
      </div>
      <div className="relative flex-1 flex h-(--mainHeight) transition-all">
        <Chat />
      </div>
    </div>
  )
}
