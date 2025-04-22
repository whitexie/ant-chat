import type { ConversationsId, IConversations } from '@/db/interface'
import type { ConversationsProps } from '@ant-design/x'
import type { MenuProps } from 'antd'
import Settings from '@/components/Settings'
import { ANT_CHAT_STRUCTURE } from '@/constants'
import { exportMessages } from '@/db'
import { useConversationRename } from '@/hooks/useConversationRename'
import {
  clearConversationsAction,
  deleteConversationsAction,
  importConversationsAction,
  nextPageConversationsAction,
  renameConversationsAction,
  useConversationsStore,
} from '@/store/conversation'
import { setActiveConversationsId, useMessagesStore } from '@/store/messages'
import { exportAntChatFile, getNow, importAntChatFile } from '@/utils'
import { ClearOutlined, DeleteOutlined, EditOutlined, ExportOutlined, ImportOutlined, MessageOutlined } from '@ant-design/icons'
import { Conversations } from '@ant-design/x'
import { App, Button, Dropdown } from 'antd'
import dayjs from 'dayjs'
import { lazy, Suspense, useState } from 'react'
import DarkButton from '../DarkButton'
import { InfiniteScroll } from '../InfiniteScroll'
import Loading from '../Loading'
import { VersionButton } from '../Version'

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

  const [loading, setLoading] = useState(false)
  const conversations = useConversationsStore(state => state.conversations)
  const activeConversationsId = useMessagesStore(state => state.activeConversationsId)
  const pageIndex = useConversationsStore(state => state.pageIndex)
  const conversationsTotal = useConversationsStore(state => state.conversationsTotal)

  const hasMore = conversationsTotal > conversations.length

  const disabledClear = conversations.length === 0

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
      e.domEvent.stopPropagation()
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
            deleteConversationsAction(conversation.key as ConversationsId)
          },
        })
      }
    },
  })

  const items = [...conversations].sort((a, b) => b.updateAt - a.updateAt).map((item) => {
    const { id: key, title: label } = item
    return { key, label, icon: <MessageOutlined />, group: getGroup(item) }
  })

  const onClickMenu: MenuProps['onClick'] = async (e) => {
    async function handleImport() {
      try {
        const data = await importAntChatFile()
        importConversationsAction(data)

        message.success('导入成功')
      }
      catch (error: unknown) {
        message.error((error as Error).message)
      }
    }

    async function handleExport() {
      const messages = await exportMessages()
      const data = Object.assign({}, ANT_CHAT_STRUCTURE, { conversations, messages, exportTime: getNow() })
      await exportAntChatFile(JSON.stringify(data, null, 2), 'ant-chat.antchat')
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

  async function onActiveChange(value: ConversationsId) {
    await setActiveConversationsId(value)
  }

  const buttonsRender = ([,rightButton]: React.ReactNode[]) => [
    <Button
      type="primary"
      key={0}
      className="flex-1"
      onClick={async () => {
        await setActiveConversationsId('')
      }}
    >
      新对话
    </Button>,
    rightButton,
  ]

  return (
    <div className="h-full grid grid-rows-[max-content_1fr_max-content]">
      <div className="w-full py-2 px-1">
        <Dropdown.Button type="primary" buttonsRender={buttonsRender} menu={{ items: dropdownButtons, onClick: onClickMenu }} />
      </div>
      <InfiniteScroll
        hasMore={hasMore}
        loading={loading}
        direction="bottom"
        noMoreComponent={pageIndex > 0 ? (<div className="text-center text-gray-500 py-1">已经到底了~</div>) : null}
        onLoadMore={async () => {
          if (loading) {
            return
          }
          setLoading(true)
          await nextPageConversationsAction()
          setLoading(false)
        }}
      >

        <Conversations
          groupable
          activeKey={activeConversationsId}
          menu={conversationsMenuConfig}
          onActiveChange={(value: string) => onActiveChange(value as ConversationsId)}
          items={items}
        />
      </InfiniteScroll>
      <div className="footer border-t-solid border-1px border-black/10 dark:border-white/40 flex flex-col gap-1 px-1 py-2">
        <DarkButton />
        <Settings />
        <VersionButton />
      </div>
      <Suspense fallback={<Loading />}>
        <RenameModal
          isRenameModalOpen={isRenameModalOpen}
          closeRenameModal={closeRenameModal}
          renameConversation={renameConversationsAction}
          renameId={renameId as string}
          newName={newName}
          onChange={changeRename}
        />
      </Suspense>
    </div>
  )
}

function getGroup(item: IConversations) {
  const now = dayjs()
  const createAtDate = dayjs(item.updateAt)
  const createAtTs = createAtDate.valueOf()
  const todayStart = now.startOf('day').valueOf()
  const yesterdayStart = now.subtract(1, 'day').startOf('day').valueOf()

  if (createAtTs >= todayStart)
    return '今日'

  if (createAtTs >= yesterdayStart)
    return '昨日'

  if (createAtDate.isSame(now, 'week'))
    return '本周'

  if (createAtDate.isSame(now, 'month'))
    return '本月'

  return createAtDate.format('YYYY-MM')
}
