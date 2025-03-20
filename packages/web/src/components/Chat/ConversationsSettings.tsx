import type { IConversations } from '@/db/interface'
import type { UpdateConversationsSettingsConfig } from '@/store/conversation'
import type { TabsProps } from 'antd'
import type { ConversationsFormInstance } from '../Settings/ConversationsForm'
import type { ModelSettingsFormInstance } from '../Settings/ModelSettingsForm'
import { Role } from '@/constants'
import { useMessagesStore } from '@/store/messages'
import { useModelConfigStore } from '@/store/modelConfig'
import { MessageOutlined, SettingOutlined } from '@ant-design/icons'
import { Modal, Tabs } from 'antd'
import { useRef, useState } from 'react'
import ConversationsForm from '../Settings/ConversationsForm'
import ModelSettingsForm from '../Settings/ModelSettingsForm'

interface ConversationsSettingsProps {
  open: boolean
  onClose: (isOpen: boolean) => void
  conversations: IConversations
  onSave?: (values: UpdateConversationsSettingsConfig) => void
}

function ConversationsSettings({ open, onClose, conversations, onSave }: ConversationsSettingsProps) {
  const defaultSystemPrompt = useModelConfigStore(state => state.systemMessage)
  const configMapping = useModelConfigStore(state => state.configMapping)

  const messages = useMessagesStore(state => state.messages)

  const conversationsFormRef = useRef<ConversationsFormInstance>(null)
  const modelSettingsFormRef = useRef<ModelSettingsFormInstance>(null)

  const systemPrompt = messages.find(item => item.role === Role.SYSTEM)?.content as string ?? defaultSystemPrompt

  const [config, setConfig] = useState(conversations.settings?.modelConfig ?? null)

  const items: TabsProps['items'] = [
    {
      key: 'conversation',
      label: '对话',
      icon: <MessageOutlined />,
      children: <ConversationsForm ref={conversationsFormRef} title={conversations.title} systemPrompt={systemPrompt} />,
    },
    {
      key: 'model',
      label: '模型',
      icon: <SettingOutlined />,
      children: (
        <ModelSettingsForm
          ref={modelSettingsFormRef}
          showReset
          key={config?.id || ''}
          initialValues={config}
          onProviderChange={onProviderChange}
          onReset={() => setConfig(null)}
        />
      ),
    },
  ]

  function onProviderChange(value: string) {
    if (Object.keys(configMapping).includes(value)) {
      setConfig(configMapping[value as keyof typeof configMapping])
    }
  }

  async function onOk() {
    const modelValues = modelSettingsFormRef.current?.getValues()

    if (modelValues?.id) {
      await modelSettingsFormRef.current?.validateFields()
    }

    const modelConfig = modelValues?.id ? modelValues : null
    const values = conversationsFormRef.current?.getValues()

    // console.log('result => ', { modelConfig })
    onSave?.({ ...values, modelConfig })
    onClose(false)
  }

  return (
    <Modal title="对话设置" open={open} onOk={onOk} onCancel={() => onClose(false)}>
      {
        open && (
          <Tabs items={items} />
        )
      }
    </Modal>
  )
}

export default ConversationsSettings
