import type { IConversationsSettings } from '@/db/interface'
import type { FormInstance } from 'antd'
import ModelSettingsForm from '@/components/Settings/ModelSettingsForm'
import ProviderDropdown from '@/components/Settings/ProviderDropdown'
import { getActiveModelConfig } from '@/store/modelConfig'
import { Modal } from 'antd'
import { merge } from 'lodash-es'
import { useRef, useState } from 'react'

interface ConversationsSettingsProps {
  open: boolean
  onClose?: () => void
  initialValues?: IConversationsSettings
  onSave?: (config: IConversationsSettings) => void
}

function ConversationsSettings(props: ConversationsSettingsProps) {
  const formRef = useRef<FormInstance>(null)
  const [active, setActive] = useState(props.initialValues?.modelConfig.id || 'Gemini')
  const initialValues = merge({}, getActiveModelConfig(), props.initialValues?.modelConfig)

  function onOk() {
    formRef.current?.validateFields().then((values) => {
      props.onSave?.({ modelConfig: values, systemMessage: props.initialValues?.systemMessage || '' })
      props.onClose?.()
    })
  }

  return (
    <Modal title="对话设置(仅用于当前对话)" open={props.open} onCancel={props?.onClose} onOk={onOk}>
      <ModelSettingsForm
        active={active}
        ref={formRef}
        initialValues={initialValues}
        header={<ProviderDropdown value={active} onChange={setActive} />}
      />
    </Modal>
  )
}

export default ConversationsSettings
