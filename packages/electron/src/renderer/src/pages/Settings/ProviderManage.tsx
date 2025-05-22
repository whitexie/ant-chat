import type { ProviderServiceSchema } from '@ant-chat/shared'
import { useRequest } from 'ahooks'
import { Button, Empty, Switch } from 'antd'
import React from 'react'
import Logo from '@/../public/logo.svg?react'
import { dbApi } from '@/api/dbApi'
import { getProviderLogo } from '@/components/Chat/providerLogo'
import { ProviderServiceSettings } from '@/components/ProviderManage/ProviderServiceSettings'

export default function ProviderManage() {
  const [activeProvider, setActiveProvider] = React.useState<ProviderServiceSchema | null>(null)
  const { data, error, refresh } = useRequest(dbApi.getAllProviderServices)

  if (error) {
    return (
      <Empty description={error.message}>
        <Button type="text" onClick={() => refresh()}> 重试 </Button>
      </Empty>
    )
  }

  return (
    <div className="flex h-full">
      <div className="flex flex-shrink-0 flex-col
      h-[100dvh] overflow-y-auto gap-2 px-2 py-2 w-50 border-r border-r-solid border-black/10 dark:border-white/20"
      >
        {
          data?.map(item => (
            <div
              key={item.id}
              className={`
                ${activeProvider?.id === item.id ? 'bg-black/3' : ''}
                group
                flex justify-between items-center gap-2 
                px-3 p-2 select-none
                hover:bg-black/3 rounded-md cursor-pointer
              `}
              onClick={() => {
                setActiveProvider(item)
              }}
            >
              <div className="flex items-center gap-2 text-base">
                <div className="rounded bg-white p-1">
                  {(() => {
                    const Icon = getProviderLogo(item.id)
                    return Icon ? <Icon /> : <Logo />
                  })()}
                </div>

                <span className="text-sm font-medium">
                  {item.name}
                </span>
              </div>
              <Switch
                value={item.isEnabled}
                onChange={async (e) => {
                  await dbApi.updateProviderService({ id: item.id, isEnabled: e })
                  refresh()
                }}
                size="small"
                className="hidden group-hover:block"
              />
            </div>
          ))
        }
        {/* TODO 添加自定义提供商 */}
      </div>
      {
        activeProvider
          ? (
              <ProviderServiceSettings
                key={activeProvider?.id || ''}
                item={activeProvider}
                onChange={async (e) => {
                  await dbApi.updateProviderService(e)
                  refresh()
                }}
              />
            )
          : null
      }
    </div>
  )
}
