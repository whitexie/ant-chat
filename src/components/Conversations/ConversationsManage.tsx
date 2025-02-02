import type { MenuProps } from 'antd'
import Settings from '@/components/Settings'
import { ANT_CHAT_STRUCTURE, DEFAULT_TITLE } from '@/constants'
import { useConversationRename } from '@/hooks/useConversationRename'
import { addConversationsAction, clearConversationsAction, createConversation, deleteConversationsAction, importConversationsAction, renameConversationsAction, setActiveConversationsId, useConversationsStore } from '@/store/conversation'
import { exportAntChatFile, getNow, importAntChatFile } from '@/utils'
import { ClearOutlined, DeleteOutlined, EditOutlined, ExportOutlined, ImportOutlined, MessageOutlined } from '@ant-design/icons'
import { Conversations, type ConversationsProps } from '@ant-design/x'
import { App, Button, Dropdown } from 'antd'
import { lazy, Suspense } from 'react'
import Loading from '../Loading'
import { VersionButton } from '../Version'
import { useConversationsListHeight } from './useConversationsListHeight'

const RenameModal = lazy(() => import('./RenameModal'))

export default function ConversationsManage() {
  const { message, modal } = App.useApp()
  const {
    openRenameModal,
    changeRename,
    closeRenameModal,
    isRenameModalOpen,
    newName,
    renameId,
  } = useConversationRename()

  const conversations = useConversationsStore(state => state.conversations)
  const activeConversationId = useConversationsStore(state => state.activeConversationId)

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
            deleteConversationsAction(conversation.key)
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
        importConversationsAction(data.conversations)

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
          clearConversationsAction()
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

  async function onActiveChange(value: string) {
    await setActiveConversationsId(value)
  }

  const buttonsRender = ([,rightButton]: React.ReactNode[]) => [
    <Button
      type="primary"
      key={0}
      className="flex-1"
      onClick={async () => {
        const item = createConversation({ title: DEFAULT_TITLE })
        await addConversationsAction(item)
        await setActiveConversationsId(item.id)
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
            activeKey={activeConversationId}
            menu={conversationsMenuConfig}
            onActiveChange={onActiveChange}
            items={items}
          />
        </div>
      </div>
      <div ref={footerDivRef} className="footer flex flex-col gap-1 px-1 py-2">
        <Settings />
        <VersionButton />
      </div>
      <Suspense fallback={<Loading />}>
        <RenameModal
          isRenameModalOpen={isRenameModalOpen}
          closeRenameModal={closeRenameModal}
          renameConversation={renameConversationsAction}
          renameId={renameId}
          newName={newName}
          onChange={changeRename}
        />
      </Suspense>
    </div>
  )
}
