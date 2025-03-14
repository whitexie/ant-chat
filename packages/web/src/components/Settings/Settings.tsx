import { setActiveAction, setConfigAction, setOpenSettingsModalAction, setSystemPromptAction, useModelConfigStore } from '@/store/modelConfig'
import { SettingOutlined } from '@ant-design/icons'
import { lazy } from 'react'

import SideButton from '../SideButton'

const SettingsModal = lazy(() => import('./Modal'))

export default function Settings() {
  const open = useModelConfigStore(state => state.openSettingsModal)

  return (
    <>
      <SideButton
        icon={<SettingOutlined className="w-4 h-4" />}
        onClick={() => setOpenSettingsModalAction(true)}
      >
        设置
      </SideButton>
      <SettingsModal
        open={open}
        onSave={(active, config) => {
          const { systemPrompt, modelConfig } = config

          setSystemPromptAction(systemPrompt)
          setActiveAction(active)
          setConfigAction(active, modelConfig)
        }}
        onClose={() => setOpenSettingsModalAction(false)}
      />
    </>
  )
}
