import { useTheme } from '@/contexts/theme/themeContext'
import { useToken } from '@/utils'
import { MoonFilled, SunFilled } from '@ant-design/icons'
import { Button } from 'antd'

export default function Header() {
  const { token } = useToken()
  const [theme, toggleTheme] = useTheme()

  const icon = theme === 'default' ? <SunFilled /> : <MoonFilled />
  return (
    <section className="h-[var(--headerHeight)] flex justify-between items-center shadow">
      <div className="logo flex justify-center items-center gap-2 w-[var(--conversationWidth)]">
        <div className="w-7 h-7">
          <img src="/logo.svg" alt="logo" className="w-full h-full" />
        </div>
        <div
          className="text-5 line-height-32px"
          style={{
            color: token.colorText,
          }}
        >
          Ant Chat
        </div>
      </div>
      <div className="flex items-center px-4">
        <div className="flex justify-center items-center rounded-xl">
          <Button type="text" shape="circle" icon={icon} onClick={() => toggleTheme?.()} />
        </div>
      </div>
    </section>
  )
}
