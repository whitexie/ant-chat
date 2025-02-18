import { MenuOutlined } from '@ant-design/icons'
import { Button } from 'antd'

interface LogoProps {
  show?: boolean
  onChange?: (show: boolean) => void
}

export function Logo(props: LogoProps) {
  return (
    <div className="relative logo flex select-none justify-center w-full items-center gap-2 w-[var(--conversationWidth)]">
      <Button
        type="text"
        className="block md:hidden absolute left-2 top-0"
        onClick={() => props.onChange?.(!props.show)}
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
