import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { RightOutlined, SettingOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { Input, Popover } from 'antd'
import React from 'react'
import { dbApi } from '@/api/dbApi'
import { getProviderLogo } from '../Chat/providerLogo'

interface PickerModelProps {
  value: AllAvailableModelsSchema['models'][number] | null
  onChange?: (value: AllAvailableModelsSchema['models'][number]) => void
}

export function PickerModel({ value, onChange }: PickerModelProps) {
  const [openPopover, setOpenPopover] = React.useState(false)
  const [keyword, setKeyword] = React.useState('')
  const { data } = useRequest(dbApi.getAllAbvailableModels)

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
      styles={{
        body: {
          padding: 0,
        },
      }}
      content={(
        <div>
          <div className="p-2 pt-2">
            <Input
              size="small"
              placeholder="搜索模型"
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>

          <div className="mt-1 max-h-38 px-2 overflow-y-auto">
            {
              data?.length
                ? (
                    data.map(item => (
                      <div key={item.id}>
                        <div className="text-xs text-gray-500 mt-1">{item.name}</div>
                        <div>
                          {item.models.filter(model => model.name.includes(keyword)).map(model => (
                            <div
                              key={model.id}
                              className="flex items-center gap-1 p-2 text-xs cursor-pointer hover:bg-(--hover-bg-color) rounded-md"
                              onClick={() => {
                                onChange?.(model)
                                setKeyword('')
                                setOpenPopover(false)
                              }}
                            >
                              {renderProviderLogo(item.id)}
                              <span className="font-medium">
                                {model.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="h-1"></div>
                      </div>
                    ))
                  )
                : (
                    <div className="text-xs text-center p-2">
                      暂无模型，请先启用AI服务商
                    </div>
                  )
            }
          </div>

        </div>
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

function renderProviderLogo(providerServiceId: string) {
  const Logo = getProviderLogo(providerServiceId)

  if (!Logo)
    return null

  return <span className="bg-white p-1 rounded-md"><Logo /></span>
}
