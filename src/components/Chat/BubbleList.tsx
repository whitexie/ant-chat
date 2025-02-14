import type { ConversationsId, IConversations, IMessage, ModelConfig } from '@/db/interface'
import type { BubbleDataType } from '@ant-design/x/es/bubble/BubbleList'
import { Role } from '@/constants'
import { deleteMessageAction, refreshRequestAction } from '@/store/conversation'
import { clipboardWriteText, formatTime } from '@/utils'
import { Bubble } from '@ant-design/x'
import { App, Typography } from 'antd'
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
    const { id: key, role, content, status, createAt } = msg
    const item: BubbleDataType = {
      role,
      content,
      key,
      loading: status === 'loading',
      header: <div className="text-xs flex items-center">{formatTime(createAt)}</div>,
      footer: <BubbleFooter message={msg} onClick={handleFooterButtonClick} />,
    }

    if (item.role === Role.AI && status === 'error') {
      item.content = (
        <>
          <Typography.Paragraph>
            <Typography.Text type="danger">{content as string}</Typography.Text>
          </Typography.Paragraph>
          <Typography.Paragraph>
            <Typography.Text type="danger">请求失败，请检查配置是否正确</Typography.Text>
          </Typography.Paragraph>
        </>
      )
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
      refresh: () => refreshRequestAction(activeConversationId as ConversationsId, message, config),
      delete: () => deleteMessageAction(message.id),
    }
    mapping[buttonName as keyof typeof mapping]?.()
  }

  return (
    <div>
      <Bubble.List
        items={bubbleList}
        roles={roles}
        className="h-[var(--bubbleListHeight)] scroll-hidden"
      />
    </div>
  )
}

export default BubbleList
