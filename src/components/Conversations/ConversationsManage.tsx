import type { MenuProps } from 'antd'
import Icon from '@/components/Icon'
import { DEFAULT_TITLE } from '@/constants'
import { useActiveConversationIdContext } from '@/contexts/activeIdConversations'
import { useConversationStore } from '@/stores/conversations'
import { createConversation } from '@/stores/conversations/reducer'

import { Conversations } from '@ant-design/x'
import { Button, Dropdown } from 'antd'

const dropdownButtons = [
  { key: 'import', label: '导入', icon: <Icon name="i-ant-design:import-outlined" classNames="mr-2" /> },
  { key: 'export', label: '导出', icon: <Icon name="i-ant-design:export-outlined" classNames="mr-2" /> },
]

export default function ConversationsManage() {
  const [conversations, dispatch] = useConversationStore()
  const [activeId, updateActiveId] = useActiveConversationIdContext()

  const items = conversations!.map((item) => {
    const { id: key, title: label } = item
    return { key, label, icon: <Icon name="i-ant-design:message-outlined" style={{ width: '1.2em', height: '1.2em' }} /> }
  })

  const onClickMenu: MenuProps['onClick'] = (e) => {
    console.log('e => ', e)

    if (e.key === 'import') {
      dispatch!({ type: 'improt', option: [] })
    }
  }

  function onActiveChange(value: string) {
    updateActiveId!(value)
  }

  const buttonsRender = ([,rightButton]: React.ReactNode[]) => [
    <Button
      type="primary"
      key={0}
      className="flex-1"
      onClick={() => {
        const item = createConversation({ title: DEFAULT_TITLE })
        dispatch!({ type: 'add', item })
        updateActiveId!(item.id)
      }}
    >
      新对话
    </Button>,
    rightButton,
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="w-full flex-shrink-0 py-2 px-1">
        <Dropdown.Button type="primary" buttonsRender={buttonsRender} menu={{ items: dropdownButtons, onClick: onClickMenu }} />
      </div>
      <div className="flex-1">
        <Conversations activeKey={activeId} onActiveChange={onActiveChange} items={items} />
      </div>
    </div>
  )
}
