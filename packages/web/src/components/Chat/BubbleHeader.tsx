import type { IModelInfo } from '@/db/interface'
import { formatTime } from '@/utils'
import { Tag } from 'antd'

interface BubbleHeaderProps {
  time?: number
  modelInfo?: IModelInfo
}

export function BubbleHeader({ time, modelInfo }: BubbleHeaderProps) {
  return (
    <div className="text-xs flex items-center">
      <div className="mr-2">
        {time ? formatTime(time) : ''}
      </div>
      {
        modelInfo && (
          <>
            <Tag color="lime">{modelInfo.provider}</Tag>
            <Tag color="green">{modelInfo.model}</Tag>
          </>
        )
      }
    </div>
  )
}
