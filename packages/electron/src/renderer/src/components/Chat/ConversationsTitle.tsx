import type { IConversations } from '@ant-chat/shared'
import type { ItemType } from 'antd/es/menu/interface'
import { renameConversationsAction } from '@/store/conversation'
import { CheckOutlined, EditOutlined, MoreOutlined } from '@ant-design/icons'
import { App, Button, Dropdown, Input } from 'antd'
import React from 'react'

interface ConversationsTitleProps {
  conversation?: IConversations
  items?: ItemType[]
}

const ConversationsTitle: React.FunctionComponent<ConversationsTitleProps> = ({ conversation, items }) => {
  const [isEditing, setIsEditing] = React.useState(false)
  const [title, setTitle] = React.useState(conversation?.title || '')
  const { message } = App.useApp()

  if (!conversation) {
    return null
  }

  async function handleRename() {
    if (!conversation)
      return

    if (!title.length) {
      message.error('标题不能为空')
      return
    }

    await renameConversationsAction(conversation.id, title)
    setIsEditing(false)
  }

  return (
    <div className="h-(--titleHeight)">
      <div className="h-(--titleHeight) flex items-center bg-(--ant-layout-color-bg-body) border-solid border-black/10 border-b-1 dark:border-white/40 px-3 justify-between">
        {isEditing
          ? (
              <div className="flex items-center gap-2">
                <Input autoFocus value={title} onBlur={handleRename} onChange={e => setTitle(e.target.value)} onPressEnter={handleRename} />
                <Button type="text" icon={<CheckOutlined />} onClick={handleRename} />
              </div>
            )
          : (
              <div className="flex items-center gap-2">
                {conversation?.title}
                <Button type="text" icon={<EditOutlined />} onClick={() => setIsEditing(true)} />
              </div>
            )}
        <div className="more-actions">
          <Dropdown menu={{ items }} trigger={['click']} placement="bottomRight" arrow>
            <Button type="text" icon={<MoreOutlined style={{ fontSize: 24 }} />} />
          </Dropdown>
        </div>
      </div>
    </div>
  )
}

export default ConversationsTitle
