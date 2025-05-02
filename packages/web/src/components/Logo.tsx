import { MenuOutlined } from '@ant-design/icons'
import { Button } from 'antd'

interface LogoProps {
  show?: boolean
  onChange?: (show: boolean) => void
}

export function Logo({ show, onChange }: LogoProps) {
  return (
    <div className="w-full flex justify-center items-center gap-2 relative logo select-none md:w-[var(--conversationWidth)]">
      <Button
        type="text"
        className="absolute top-0 block md:hidden left-2"
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
