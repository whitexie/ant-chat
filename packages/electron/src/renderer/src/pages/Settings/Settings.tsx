import Icon, { CrownOutlined, SettingOutlined } from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router'
import MCPIcon from '@/assets/icons/mcp.svg?react'

export default function Settings() {
  const navigrate = useNavigate()
  const location = useLocation()
  const activeName = location.pathname.split('/').pop() || 'provider'
  const menus = [
    { id: 'general', name: '通用设置', icon: <SettingOutlined /> },
    { id: 'provider', name: 'AI服务商设置', icon: <CrownOutlined /> },
    { id: 'mcp', name: 'MCP设置', icon: <Icon component={MCPIcon} /> },
  ]

  return (
    <div className="w-full h-full grid grid-cols-[max-content_1fr]">
      <div className="h-full w-50 border-r-solid border-(--border-color) border-r-1 p-2 text-gray py-4">
        <div className="flex flex-col gap-3">
          {
            menus.map(item => (
              <div
                key={item.id}
                className={`
                  flex gap-3 items-center 
                  px-4 h-10
                  hover:bg-(--hover-bg-color)
                  rounded-md 
                  cursor-pointer
                  ${activeName === item.id ? 'bg-(--hover-bg-color)' : ''}
                `}
                onClick={() => {
                  navigrate(`/settings/${item.id}`)
                }}
              >
                <div className="text-xl">
                  {item.icon}
                </div>
                <div>
                  {item.name}
                </div>
              </div>
            ))
          }
        </div>
      </div>
      <div>
        <Outlet />
      </div>
    </div>
  )
}
