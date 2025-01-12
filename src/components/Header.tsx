import { useTheme } from '@/contexts/theme/themeContext'
import { useToken } from '@/utils'
import { Button } from 'antd'
import Icon from './Icon'

export default function Header() {
  const { token } = useToken()
  const [theme, toggleTheme] = useTheme()

  const iconName = theme === 'default' ? 'i-ant-design:sun-filled' : 'i-ant-design:moon-filled'
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
          <Button type="text" shape="circle" icon={<Icon name={iconName} />} onClick={() => toggleTheme()} />
        </div>
      </div>
    </section>
  )
}
