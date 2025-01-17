import type { MenuProps } from 'antd'
import Settings from '@/components/Settings'
import { ANT_CHAT_STRUCTURE, DEFAULT_TITLE } from '@/constants'
import { useActiveConversationIdContext } from '@/contexts/ActiveConversationId'
import { useConversationRename } from '@/hooks/useConversationRename'
import { useConversationStore } from '@/stores/conversations'

import { createConversation } from '@/stores/conversations/reducer'
import { exportAntChatFile, getNow, importAntChatFile } from '@/utils'
import { ClearOutlined, DeleteOutlined, EditOutlined, ExportOutlined, ImportOutlined, MessageOutlined } from '@ant-design/icons'
import { Conversations, type ConversationsProps } from '@ant-design/x'
import { App, Button, Dropdown, Input, Modal } from 'antd'
import { useConversationsListHeight } from './useConversationsListHeight'

export default function ConversationsManage() {
  const [conversations, dispatch] = useConversationStore()
  const [activeId, updateActiveId] = useActiveConversationIdContext()
  const { message, modal } = App.useApp()
  const { openRenameModal, changeRename, closeRenameModal, isRenameModalOpen, newName, renameId } = useConversationRename()

  const { headerDivRef, footerDivRef, listHeight } = useConversationsListHeight()

  const disabledClear = conversations!.length === 0

  const dropdownButtons = [
    { key: 'import', label: '导入', icon: <ImportOutlined /> },
    { key: 'export', label: '导出', icon: <ExportOutlined /> },
    { key: 'clear', label: '清空', icon: <ClearOutlined />, danger: true, disabled: disabledClear },
  ]

  const conversationsMenuConfig: ConversationsProps['menu'] = conversation => ({
    items: [
      { key: 'rename', label: '重命名', icon: <EditOutlined /> },
      { key: 'delete', label: '删除', icon: <DeleteOutlined />, danger: true },
    ],
    onClick: (e) => {
      if (e.key === 'rename') {
        openRenameModal(conversation.key, conversation.label as string)
      }
      else if (e.key === 'delete') {
        modal.confirm({
          title: '删除对话',
          content: '删除后将无法恢复，请谨慎操作',
          cancelText: '取消',
          okType: 'danger',
          okText: '删除',
          onOk: () => {
            dispatch!({ type: 'delete', id: conversation.key })
          },
        })
      }
    },
  })

  const items = conversations!.map((item) => {
    const { id: key, title: label } = item
    return { key, label, icon: <MessageOutlined /> }
  })

  const onClickMenu: MenuProps['onClick'] = async (e) => {
    async function handleImport() {
      try {
        const data = await importAntChatFile()
        dispatch!({
          type: 'import',
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

    const key = e.key as keyof typeof handleMapping
    const func = handleMapping[key]
    func ? func() : console.error('unknown key', key)
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
    <div className="h-full grid grid-rows-[auto_1fr_auto]">
      <div ref={headerDivRef} className="w-full py-2 px-1">
        <Dropdown.Button type="primary" buttonsRender={buttonsRender} menu={{ items: dropdownButtons, onClick: onClickMenu }} />
      </div>
      <div className="overflow-hidden" style={listHeight}>
        <div className="h-full overflow-y-auto">
          <Conversations
            activeKey={activeId}
            menu={conversationsMenuConfig}
            onActiveChange={onActiveChange}
            items={items}
          />
        </div>
      </div>
      <div ref={footerDivRef} className="footer px-1 py-2">
        <Settings />

      </div>
      <Modal
        title="重命名"
        open={isRenameModalOpen}
        onCancel={() => closeRenameModal()}
        onOk={() => {
          if (newName.length < 1) {
            message.error('名称不能为空')
            throw new Error('名称不能为空')
          }
          dispatch!({ type: 'rename', id: renameId, title: newName })
          closeRenameModal()
        }}
        cancelText="取消"
      >
        <Input
          value={newName}
          onChange={(e) => {
            changeRename(e.target.value)
          }}
        />
      </Modal>
    </div>
  )
}
