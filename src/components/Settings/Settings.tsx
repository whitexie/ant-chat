import { SettingOutlined } from '@ant-design/icons'
import { lazy, useState } from 'react'

const SettingsModal = lazy(() => import('./Modal'))

export default function Settings() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="flex w-full items-center gap-4 cursor-pointer hover:bg-gray-300 p-2 rounded-md" onClick={() => setOpen(true)}>
        <div className="flex-shrink-0 flex justify-center items-center">
          <SettingOutlined className="w-4 h-4" />
        </div>
        <div className="flex-1">
          设置
        </div>
      </div>
      <SettingsModal
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  )
}
