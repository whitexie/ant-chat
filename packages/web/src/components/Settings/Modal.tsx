import type { ModelConfig, ModelConfigId } from '@/db/interface'
import type { ModelSettingsFormInstance } from './ModelSettingsForm'
import { getActiveModelConfig, useModelConfigStore } from '@/store/modelConfig'
import { Form, Input, Modal } from 'antd'
import { useRef, useState } from 'react'
import ModelSettingsForm from './ModelSettingsForm'

interface SettingsModalProps {
  open: boolean
  onClose?: () => void
  onSave?: (active: ModelConfigId, config: { systemPrompt: string, modelConfig: ModelConfig }) => void
}

function getConfigById(id: ModelConfigId): ModelConfig {
  return useModelConfigStore.getState().configMapping[id]
}

export default function SettingsModal({ open, onClose, onSave }: SettingsModalProps) {
  const formRef = useRef<ModelSettingsFormInstance>(null)
  const defaultActive = useRef(getActiveModelConfig().active)

  const defaultSystemPrompt = useModelConfigStore(state => state.systemMessage)
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt)

  const [active, setActive] = useState(defaultActive.current)

  const defaultConfig = getConfigById(active)

  function onOk() {
    formRef.current?.validateFields().then((values) => {
      onSave?.(active, { systemPrompt, modelConfig: values! })
      onClose?.()
      defaultActive.current = active
    })
  }

  return (
    <Modal
      open={open}
      title="设置"
      onOk={onOk}
      destroyOnClose
      onCancel={() => {
        onClose?.()
        setActive(defaultActive.current)
      }}
      okText="保存"
      cancelText="取消"
    >
      <ModelSettingsForm
        key={active}
        initialValues={defaultConfig}
        ref={formRef}
        onProviderChange={
          (value) => {
            setActive(value as ModelConfigId)
          }
        }
      >
        <Form.Item label="新对话的默认提示">
          <Input.TextArea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
        </Form.Item>
      </ModelSettingsForm>
    </Modal>
  )
}
