import { Tooltip } from 'antd'

interface SliderMenuItemProps {
  icon?: React.ReactNode
  title?: string | null
  path: string
  actived?: boolean
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>, path: string) => void
}

export function SliderMenuItem({ icon, title, path, actived, onClick }: SliderMenuItemProps) {
  return (
    <Tooltip title={title} mouseEnterDelay={0.5} placement="right">
      <div
        className={`
          w-8 h-8 
          flex justify-center items-center 
          rounded-1 
          hover:(bg-black/3 dark:bg-white/10) 
          cursor-pointer 
          ${actived ? 'bg-black/3 dark:bg-white/10' : ''}
      `}
        onClick={(e) => {
          onClick?.(e, path)
        }}
      >
        {icon}
      </div>
    </Tooltip>
  )
}
