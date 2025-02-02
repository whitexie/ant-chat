import { setConfigAction, useModelConfigStore } from '@/store/modelConfig'
import { SettingOutlined } from '@ant-design/icons'
import { lazy, useState } from 'react'

import { SideButton } from '../SideButton'

const SettingsModal = lazy(() => import('./Modal'))

export default function Settings() {
  const [open, setOpen] = useState(false)
  const config = useModelConfigStore(state => state.configMapping[state.active])

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
        onSave={setConfigAction}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
