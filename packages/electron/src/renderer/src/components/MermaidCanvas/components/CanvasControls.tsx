import {
  AimOutlined,
  DownloadOutlined,
} from '@ant-design/icons'
import { Button } from 'antd'
import React from 'react'

interface CanvasControlsProps {
  onReset?: () => void
  onDownload?: () => void
}

export const CanvasControls: React.FC<CanvasControlsProps> = ({
  onReset,
  onDownload,
}) => {
  return (
    <div
      className="absolute flex gap-2 bg-white rounded-md top-5 right-5 p-2 dark:bg-[#222] shadow-md"
    >
      {
        onReset && (
          <Button
            icon={<AimOutlined />}
            onClick={onReset}
            title="重置"
          />
        )
      }

      {
        onDownload && (
          <Button
            icon={<DownloadOutlined />}
            onClick={onDownload}
            title="下载"
          />
        )
      }
    </div>
  )
}
