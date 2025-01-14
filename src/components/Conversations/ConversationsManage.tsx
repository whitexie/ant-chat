import type { MenuProps } from 'antd'
import { ANT_CHAT_STRUCTURE, DEFAULT_TITLE } from '@/constants'
import { useActiveConversationIdContext } from '@/contexts/activeIdConversations'
import { useConversationStore } from '@/stores/conversations'
import { createConversation } from '@/stores/conversations/reducer'

import { exportAntChatFile, getNow, importAntChatFile } from '@/utils'
import { ClearOutlined, ExportOutlined, ImportOutlined, MessageOutlined } from '@ant-design/icons'
import { Conversations } from '@ant-design/x'
import { App, Button, Dropdown } from 'antd'

export default function ConversationsManage() {
  const [conversations, dispatch] = useConversationStore()
  const [activeId, updateActiveId] = useActiveConversationIdContext()
  const { message, modal } = App.useApp()

  const disabledClear = conversations!.length === 0

  const dropdownButtons = [
    { key: 'import', label: '导入', icon: <ImportOutlined /> },
    { key: 'export', label: '导出', icon: <ExportOutlined /> },
    { key: 'clear', label: '清空', icon: <ClearOutlined />, danger: true, disabled: disabledClear },
  ]

  const items = conversations!.map((item) => {
    const { id: key, title: label } = item
    return { key, label, icon: <MessageOutlined /> }
  })

  async function handleImport() {
    try {
      const data = await importAntChatFile()
      dispatch!({
        type: 'improt',
        items: data.conversations,
      })
      message.success('导入成功')
    }
    catch (error: unknown) {
      message.error((error as Error).message)
    }
  }

  function handleExport() {
    const data = Object.assign({}, ANT_CHAT_STRUCTURE, { conversations, exportTime: getNow() })
    exportAntChatFile(JSON.stringify(data, null, 2), 'ant-chat.antchat')
    message.success('导出成功')
  }

  function handleClear() {
    modal.confirm({
      title: '清空对话',
      content: '清空后将无法恢复，请谨慎操作',
      cancelText: '取消',
      okType: 'danger',
      okText: '清空',
      onOk: () => {
        dispatch!({ type: 'clear' })
        message.success('清空成功')
      },
    })
  }

  const handleMapping = {
    import: handleImport,
    export: handleExport,
    clear: handleClear,
  }

  const onClickMenu: MenuProps['onClick'] = async (e) => {
    const key = e.key as keyof typeof handleMapping

    if (handleMapping[key])
      handleMapping[key]()
    else
      console.error('unknown key', key)
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
