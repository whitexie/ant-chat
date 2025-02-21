import type { ConversationsId, IConversations, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { deleteMessageAction, refreshRequestAction } from '@/store/conversation'
import { getFeatures } from '@/store/features'
import { clipboardWriteText, formatTime } from '@/utils'
import { Bubble } from '@ant-design/x'
import { App } from 'antd'
import BubbleFooter from './BubbleFooter'
import { roles } from './roles'

interface BubbleListProps {
  currentConversations: IConversations | undefined
  messages: IMessage[]
  config: ModelConfig
}

function BubbleList({ messages, currentConversations, config }: BubbleListProps) {
  const { message: messageFunc } = App.useApp()
  const activeConversationId = currentConversations?.id || ''

  const bubbleList = messages.map((msg) => {
    const { id: key, role, content, images, attachments, status, createAt } = msg
    const item: BubbleDataType = {
      role,
      content: { content, images, attachments, status },
      key,
      loading: status === 'loading',
      header: <div className="text-xs flex items-center">{formatTime(createAt)}</div>,
      footer: <BubbleFooter message={msg} onClick={handleFooterButtonClick} />,
    }

    return item
  })

  async function copyMessage(message: IMessage) {
    const content = message.content as string
    const result = await clipboardWriteText(content)
    if (result.ok) {
      messageFunc.success(result.message)
    }
    else {
      messageFunc.error(result.message)
    }
  }

  async function handleFooterButtonClick(buttonName: string, message: IMessage) {
    const mapping = {
      copy: () => copyMessage(message),
      refresh: () => refreshRequestAction(activeConversationId as ConversationsId, message, config, getFeatures()),
      delete: () => deleteMessageAction(message.id),
    }
    mapping[buttonName as keyof typeof mapping]?.()
  }

  return (
    <div className="h-full">
      <Bubble.List
        items={bubbleList}
        roles={roles}

        className="h-full"
      />
    </div>
  )
}

export default BubbleList
