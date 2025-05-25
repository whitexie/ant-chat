import type { AllAvailableModelsSchema } from '@ant-chat/shared'
import { Input } from 'antd'
import React from 'react'
import { getProviderLogo } from '../Chat/providerLogo'

export interface SelectModelProps {
  onChange?: (value: AllAvailableModelsSchema['models'][number]) => void
  options?: AllAvailableModelsSchema[]
}

export function SelectModel({ onChange, options }: SelectModelProps) {
  const [keyword, setKeyword] = React.useState('')

  return (
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
          options?.length
            ? (
                options.map(item => (
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
  )
}

export function renderProviderLogo(providerServiceId: string) {
  const Logo = getProviderLogo(providerServiceId)

  if (!Logo)
    return null

  return <span className="bg-white p-1 rounded-md"><Logo /></span>
}
