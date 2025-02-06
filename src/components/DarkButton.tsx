import type React from 'react'
import { useThemeStore } from '@/store/theme'
import { MoonFilled, SunFilled } from '@ant-design/icons'
import SideButton from './SideButton'

const DarkButton: React.FC = () => {
  const { theme, toggleTheme } = useThemeStore()

  const icon = theme === 'default' ? <MoonFilled /> : <SunFilled />
  return (
    <SideButton icon={icon} onClick={() => toggleTheme()}>
      {theme === 'default' ? '黑暗' : '亮色'}
      模式
    </SideButton>
  )
}

export default DarkButton
