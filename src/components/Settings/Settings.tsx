import type { ModelConfigStore } from '@/store/modelConfig'
import { useModelConfigStore } from '@/store/modelConfig'
import { SettingOutlined } from '@ant-design/icons'
import { lazy, useState } from 'react'
import { useShallow } from 'zustand/shallow'

import { SideButton } from '../SideButton'

const SettingsModal = lazy(() => import('./Modal'))

export default function Settings() {
  const [open, setOpen] = useState(false)
  const setConfig = useModelConfigStore(state => state.setConfig)
  const config = useModelConfigStore(useShallow((state: ModelConfigStore) => ({
    apiHost: state.apiHost,
    apiKey: state.apiKey,
    model: state.model,
    temperature: state.temperature,
  })))

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
        config={config}
        onSave={setConfig}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
