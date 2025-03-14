import { MenuOutlined } from '@ant-design/icons'
import { Button } from 'antd'

interface LogoProps {
  show?: boolean
  onChange?: (show: boolean) => void
}

export function Logo({ show, onChange }: LogoProps) {
  return (
    <div className="relative logo w-full flex select-none justify-center items-center gap-2 md:w-[var(--conversationWidth)]">
      <Button
        type="text"
        className="block md:hidden absolute left-2 top-0"
        onClick={() => onChange?.(!show)}
        icon={<MenuOutlined />}
      />

      <div className="w-7 h-7">
        <img src="/logo.svg" alt="logo" className="w-full h-full" draggable={false} />
      </div>
      <div
        className="text-5 line-height-32px"
      >
        Ant Chat
      </div>
    </div>
  )
}
