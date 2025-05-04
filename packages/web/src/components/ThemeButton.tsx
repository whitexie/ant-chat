import { useThemeStore } from '@/store/theme'
import { CloudSyncOutlined, MoonFilled, SunFilled } from '@ant-design/icons'
import { Popover } from 'antd'
import { useState } from 'react'

const options = [
  { id: 'auto' as const, icon: <CloudSyncOutlined />, label: '跟随系统' },
  { id: 'light' as const, icon: <SunFilled />, label: '亮色主题' },
  { id: 'dark' as const, icon: <MoonFilled />, label: '暗黑主题' },
]

function ThemeButton() {
  const { theme, setThemeMode } = useThemeStore()

  const [open, setOpen] = useState(false)

  const hide = () => {
    setOpen(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
  }

  const icon = theme === 'light' ? <SunFilled /> : <MoonFilled />

  return (
    <Popover
      content={(
        <div className="flex flex-col gap-2">
          {
            options.map(item => (
              <div
                key={item.id}
                className="flex items-center gap-2 cursor-pointer antd-css-var hover:text-(--ant-color-primary-text-hover)"
                onClick={() => {
                  setThemeMode(item.id)
                  hide()
                }}
              >
                {item.icon}
                {item.label}
              </div>
            ))
          }
        </div>
      )}
      placement="right"
      trigger="click"
      open={open}
      onOpenChange={handleOpenChange}
      zIndex={100}
    >
      <div
        className={`
          w-9 h-9 
          flex justify-center items-center 
          rounded-md 
          hover:bg-black/3 hover:dark:bg-white/10 
          cursor-pointer 
          text-xl
        `}
      >
        {icon}
      </div>
    </Popover>
  )
}

export default ThemeButton
