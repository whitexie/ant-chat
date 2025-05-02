import { Tooltip } from 'antd'

interface SliderMenuItemProps {
  icon?: React.ReactNode
  title?: string | null
  path: string
  actived?: boolean
  disabledTooltip?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => void
}

export function SliderMenuItem({ icon, title, path, actived, disabledTooltip, onClick }: SliderMenuItemProps) {
  const button = (
    <div
      className={`
          w-9 h-9 
          flex justify-center items-center 
          rounded-1 
          hover:(bg-black/3 dark:bg-white/10) 
          cursor-pointer 
          text-5.5
          ${actived ? 'bg-black/3 dark:bg-white/10' : ''}
      `}
      onClick={(e) => {
        onClick?.(e, path)
      }}
    >
      {icon}
    </div>
  )

  if (disabledTooltip) {
    return button
  }

  return (
    <Tooltip title={title} mouseEnterDelay={0.5} placement="right">
      {button}
    </Tooltip>
  )
}
