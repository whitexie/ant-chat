import type { FormInstance } from 'antd'
import { setActiveAction, useActiveModelConfig, useModelConfigStore } from '@/store/modelConfig'
import { Modal } from 'antd'
import { useRef } from 'react'
import { useShallow } from 'zustand/shallow'
import ModelSettingsForm from './ModelSettingsForm'
import ProviderDropdown from './ProviderDropdown'

interface SettingsModalProps {
  open: boolean
  onClose?: () => void
  config: ModelConfig
  onSave?: (config: ModelConfig) => void
}

export default function SettingsModal({ open, onClose, onSave }: SettingsModalProps) {
  const formRef = useRef<FormInstance>(null)

  const active = useModelConfigStore(useShallow(state => state.active))
  const config = useActiveModelConfig()

  function onOk() {
    formRef.current?.validateFields().then((values) => {
      onSave?.(values)
      onClose?.()
    })
  }

  return (
    <Modal open={open} title="设置" onOk={onOk} onCancel={onClose} okText="保存" cancelText="取消">
      <ModelSettingsForm
        key={active}
        active={active}
        initialValues={config}
        ref={formRef}
        header={<ProviderDropdown value={active} onChange={setActiveAction} />}
      />
    </Modal>
  )
}
