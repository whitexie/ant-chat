import MCPIcon from '@/assets/icons/mcp.svg?react'
import Icon, { CrownOutlined } from '@ant-design/icons'
import { Outlet, useLocation, useNavigate } from 'react-router'

export default function Settings() {
  const navigrate = useNavigate()
  const location = useLocation()
  const activeName = location.pathname.split('/').pop() || 'provider'
  const menus = [
    { id: 'provider', name: 'AI服务商设置', icon: <CrownOutlined /> },
    { id: 'mcp', name: 'MCP设置', icon: <Icon component={MCPIcon} /> },
  ]

  return (
    <div className="w-full h-full grid grid-cols-[200px_1fr]">
      <div className="h-full border-r-solid border-black/10 border-1 p-2 text-gray py-4 dark:border-white/20">
        <div className="flex flex-col gap-3">
          {
            menus.map(item => (
              <div
                key={item.id}
                className={`
                  flex gap-3 items-center 
                  px-4 h-10
                  hover:(bg-black/3 dark:bg-white/6)
                  rounded-md 
                  cursor-pointer
                  ${activeName === item.id ? 'dark:text-white bg-black/3 dark:bg-white/10 text-black' : ''}
                `}
                onClick={() => {
                  navigrate(`/settings/${item.id}`)
                }}
              >
                <div className="text-5">
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
