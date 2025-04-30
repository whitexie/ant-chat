import { GithubFilled, MessageOutlined, SettingOutlined } from '@ant-design/icons'

import { useLocation, useNavigate } from 'react-router'
import { SliderMenuItem } from './SliderMenuItem'

export function SliderMenu() {
  const location = useLocation()
  const navigate = useNavigate()

  function handleNavigate(e: React.MouseEvent, path: string) {
    e.preventDefault()
    navigate(path)
  }

  return (
    <div className="slider border-r-solid border-r-1 h-full border-black/10 dark:border-white/20">
      <div className="flex flex-col justify-between items-center gap-2 py-4 h-full">
        <div className="flex flex-col items-center gap-2">
          <img
            src="/logo.svg"
            className="w-5 h-5 mb-4 cursor-pointer"
            draggable={false}
            onClick={() => {
              navigate('/')
            }}
          />

          <SliderMenuItem
            title="对话"
            icon={<MessageOutlined />}
            path="/chat"
            actived={location.pathname === '/chat'}
            onClick={handleNavigate}
          />

          <SliderMenuItem
            title="设置"
            icon={<SettingOutlined />}
            path="/settings"
            actived={location.pathname === '/settings'}
            onClick={handleNavigate}
          />
        </div>
        <div className="flex flex-col items-center gap-2 pb-4">
          <SliderMenuItem
            title={null}
            icon={<GithubFilled />}
            path="https://github.com/whitexie/ant-chat"
            onClick={(_, path) => {
              window.open(path)
            }}
          />
        </div>
      </div>
    </div>
  )
}
