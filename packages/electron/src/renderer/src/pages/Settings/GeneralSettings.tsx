import { InfoCircleOutlined } from '@ant-design/icons'
import { Tooltip } from 'antd'
import AssistantIcon from '@/assets/icons/Assistant.svg?react'
import { SelectModel } from '@/components/GeneralSettings/SelectModel'

export function GeneralSettings() {
  return (
    <div className="flex flex-col gap-2 p-3">
      <div className="flex flex-col gap-2">
        <GeneralSettingsItem
          title="助手模型"
          help="用于生成对话标题的模型，不设置将使用对话时选择的模型"
          icon={<AssistantIcon className="text-xl" />}
        >
          <SelectModel />
        </GeneralSettingsItem>
      </div>
    </div>
  )
}

interface GeneralSettingsItemProps {
  title: string
  help?: string
  icon?: React.ReactNode
  children?: React.ReactNode
}

function GeneralSettingsItem({ title, help, icon, children }: GeneralSettingsItemProps) {
  return (
    <div className="flex justify-between items-center gap-2 px-4">
      <span className="text-base flex items-center gap-2">
        {icon}
        {title}
        {
          help
            ? (
                <Tooltip title={help}>
                  <InfoCircleOutlined className="text-xs text-gray-500" />
                </Tooltip>
              )
            : null
        }
      </span>
      {children}
    </div>
  )
}
