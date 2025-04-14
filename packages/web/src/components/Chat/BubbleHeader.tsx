import { formatTime } from '@/utils'

interface BubbleHeaderProps {
  time?: number
}

export function BubbleHeader({ time }: BubbleHeaderProps) {
  return (
    <div className="text-xs flex items-center">{time ? formatTime(time) : ''}</div>
  )
}
