import { useThemeStore } from '@/store/theme'
import { GithubFilled, MoonFilled, SunFilled } from '@ant-design/icons'
import { Button, Tooltip } from 'antd'
import { Logo } from './Logo'

export default function Header() {
  const { theme, toggleTheme } = useThemeStore()

  const icon = theme === 'default' ? <SunFilled /> : <MoonFilled />
  return (
    <section className="h-[var(--headerHeight)] flex justify-between items-center shadow">
      <Logo />
      <div className="flex items-center px-4">
        <div className="flex justify-center gap-3 items-center rounded-xl">
          <Tooltip title="赏一颗🌟🌟🌟～">
            <Button
              type="text"
              shape="circle"
              href="https://github.com/whitexie/ant-chat"
              target="_blank"
              icon={<GithubFilled />}
            />
          </Tooltip>
          <Button type="text" shape="circle" icon={icon} onClick={() => toggleTheme?.()} />
        </div>
      </div>
    </section>
  )
}
