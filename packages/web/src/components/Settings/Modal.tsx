import type { ModelConfig, ModelConfigId } from '@/db/interface'
import type { ModelSettingsFormInstance } from './ModelSettingsForm'
import { setActiveAction, useActiveModelConfig, useModelConfigStore } from '@/store/modelConfig'
import { Form, Input, Modal } from 'antd'
import { useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'
import ModelSettingsForm from './ModelSettingsForm'

interface SettingsModalProps {
  open: boolean
  onClose?: () => void
  onSave?: (active: ModelConfigId, config: { systemPrompt: string, modelConfig: ModelConfig }) => void
}

export default function SettingsModal({ open, onClose, onSave }: SettingsModalProps) {
  const formRef = useRef<ModelSettingsFormInstance>(null)

  const defaultSystemPrompt = useModelConfigStore(state => state.systemMessage)
  const [systemPrompt, setSystemPrompt] = useState(defaultSystemPrompt)

  const active = useModelConfigStore(useShallow(state => state.active))
  const config = useActiveModelConfig()

  function onOk() {
    formRef.current?.validateFields().then((values) => {
      onSave?.(active, { systemPrompt, modelConfig: values! })
      onClose?.()
    })
  }

  return (
    <Modal open={open} title="设置" onOk={onOk} onCancel={onClose} okText="保存" cancelText="取消">
      <ModelSettingsForm
        key={active}
        initialValues={config}
        ref={formRef}
        onProviderChange={
          (value) => {
            formRef.current?.resetFields()
            setActiveAction(value as ModelConfigId)
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
