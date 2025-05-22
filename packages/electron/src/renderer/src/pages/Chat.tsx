import Chat from '@/components/Chat'
import ConversationsManage from '@/components/Conversations/ConversationsManage'

export function ChatPage() {
  return (
    <div className="flex">
      <div className="border-solid w-60 border-(--border-color) overflow-hidden border-r-1 h-[100dvh]">
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
