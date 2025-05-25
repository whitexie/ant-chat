import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { RightOutlined, SettingOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Popover } from 'antd'
import React from 'react'
import { dbApi } from '@/api/dbApi'
import { renderProviderLogo, SelectModel } from './SelectModel'

interface PickerModelProps {
  value: AllAvailableModelsSchema['models'][number] | null
  onChange?: (value: AllAvailableModelsSchema['models'][number]) => void
}

export function PickerModel({ value, onChange }: PickerModelProps) {
  const [openPopover, setOpenPopover] = React.useState(false)
  const { data } = useRequest<AllAvailableModelsSchema[], []>(dbApi.getAllAbvailableModels)

  const activeProviderServiceInfo = !value ? data?.[0] : data?.find(item => item.models.some(model => model.id === value.id))

  React.useEffect(() => {
    if (!value && activeProviderServiceInfo?.models.length) {
      onChange?.(activeProviderServiceInfo?.models[0])
    }
  })

  return (
    <Popover
      open={openPopover}
      arrow={false}
      placement="bottomLeft"
      trigger="click"
      destroyOnHidden={true}
      styles={{
        body: {
          padding: 0,
        },
      }}
      content={(
        <SelectModel
          onChange={(e) => {
            onChange?.(e)
            setOpenPopover(false)
          }}
          options={data}
        />
      )}
      onOpenChange={setOpenPopover}
    >
      <div
        className={`
          group grid grid-cols-[max-content_0fr] hover:grid-cols-[max-content_1fr]
          transition-all duration-300
          h-8 rounded-md border-1 border-solid border-(--border-color) cursor-pointer
        `}
      >
        <div className="flex items-center pl-2 gap-1 hover:bg-(--hover-bg-color)">
          {renderProviderLogo(activeProviderServiceInfo?.id || '')}
          <div className="flex items-center text-xs font-medium max-w-30 truncate">
            <span className="truncate">{value?.name}</span>
            <RightOutlined className="px-2" />
          </div>
        </div>
        <div className="overflow-hidden flex items-center justify-center group-hover">
          <SettingOutlined
            className="px-2 h-full hover:bg-(--hover-bg-color)"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              // TODO 温度、最大TOKEN等配置
            }}
          />
        </div>
      </div>
    </Popover>
  )
}
