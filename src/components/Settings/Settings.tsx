import { setConfigAction, setSystemPromptAction } from '@/store/modelConfig'
import { SettingOutlined } from '@ant-design/icons'
import { lazy, useState } from 'react'

import SideButton from '../SideButton'

const SettingsModal = lazy(() => import('./Modal'))

export default function Settings() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <SideButton
        icon={<SettingOutlined className="w-4 h-4" />}
        onClick={() => setOpen(true)}
      >
        设置
      </SideButton>
      <SettingsModal
        open={open}
        onSave={(active, config) => {
          const { systemPrompt, modelConfig } = config

          setSystemPromptAction(systemPrompt)
          setConfigAction(active, modelConfig)
        }}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
