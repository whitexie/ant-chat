import { CheckCircleOutlined, MinusCircleOutlined, PlusCircleOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { App, Button, Empty } from 'antd'
import React from 'react'
import { dbApi } from '@/api/dbApi'
import { AddModelFormModal } from './AddModelForm'

export interface ModelListProps {
  providerServiceId: string
}

export function ModelList({ providerServiceId }: ModelListProps) {
  const { message } = App.useApp()
  const [openAddModal, setAddModal] = React.useState(false)
  const { data, error, refresh, run, mutate } = useRequest(dbApi.getModelsByProviderServiceId, {
    defaultParams: [providerServiceId],
  })

  React.useEffect(() => {
    run(providerServiceId)
  }, [providerServiceId])

  if (error) {
    return (
      <Empty description={error.message}>
        <Button>重试</Button>
      </Empty>
    )
  }

  return (
    <div className="py-2">
      <Button
        size="small"
        icon={<PlusCircleOutlined />}
        onClick={() => {
          setAddModal(true)
        }}
      >
        添加模型
      </Button>
      <div className="flex flex-col mt-2 border border-(--ant-color-border) rounded-md">
        {
          data?.map(item => (
            <div key={item.id} className="flex border-b border-(--ant-color-border) last:border-0 py-2 px-3 justify-between items-center">
              <div className="flex items-center gap-1">
                {item.name}
              </div>

              <div className="flex items-center gap-2">
                {item.isBuiltin && 'default'}
                <Button
                  type="text"
                  size="small"
                  icon={item.isEnabled ? <CheckCircleOutlined className="!text-(--ant-color-success)" /> : <MinusCircleOutlined className="!text-(--ant-color-error)" />}
                  onClick={async () => {
                    await dbApi.setModelEnabledStatus(item.id, !item.isEnabled)
                    refresh()
                  }}
                />
              </div>
            </div>
          ))
        }
      </div>

      <AddModelFormModal
        open={openAddModal}
        title="添加模型"
        onCancel={() => setAddModal(false)}
        onClose={() => setAddModal(false)}
        onSave={async (e) => {
          dbApi.addProviderServiceModel({
            providerServiceId,
            ...e,
          }).then(
            (modelInfo) => {
              setAddModal(false)
              mutate([modelInfo, ...(data ?? [])])
            },
            (err: Error) => {
              message.error(err.message)
            },
          )
        }}
      />
    </div>
  )
}
