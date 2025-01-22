import type { ModelConfigStore } from '@/store/modelConfig'
import type { SelectProps } from 'antd'
import { getModels } from '@/api'
import { useModelConfigStore } from '@/store/modelConfig'
import { ReloadOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { App, Button, Form, Input, Modal, Select, Slider } from 'antd'
import { Suspense, useMemo } from 'react'
import { useShallow } from 'zustand/shallow'

function TemperatureHelp() {
  return (
    <span className="text-3">
      介于 0 和 2 之间。更高的值，如 0.8，会使输出更随机，而更低的值，如 0.2，会使其更加集中和确定。
    </span>
  )
}

const CommonRules = {
  required: true,
  message: '必填',
}

const apiHostRules = [
  CommonRules,
  {
    pattern: /^https?:\/\//,
    message: '请输入有效的 URL，如：https://api.openai.com',
  },
]

function SelectHoc({ onRefresh, loading, ...props }: SelectProps & { onRefresh: () => void, loading: boolean }) {
  return (
    <div className="flex gap-1 items-center">
      <Suspense>
        <Select
          {...props}
        />
      </Suspense>
      <Button type="text" icon={<ReloadOutlined />} onClick={onRefresh} loading={loading} />
    </div>
  )
}

interface SettingsModalProps {
  open: boolean
  onClose?: () => void
}

export default function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [form] = Form.useForm<ModelConfig>()
  const setConfig = useModelConfigStore(state => state.setConfig)
  // const setModel = useModelConfigStore(state => state.setModel)
  const { message } = App.useApp()
  const config = useModelConfigStore(useShallow((state: ModelConfigStore) => ({
    apiHost: state.apiHost,
    apiKey: state.apiKey,
    model: state.model,
    temperature: state.temperature,
  })))

  const apiHost = Form.useWatch('apiHost', form)
  const apiKey = Form.useWatch('apiKey', form)

  const { data: models, refresh, loading } = useRequest(
    () => {
      if (!apiHost || !apiKey || !open)
        return Promise.resolve([])

      try {
        const result = getModels(apiHost, apiKey)
        return result
      }
      catch (error) {
        return Promise.reject(error)
      }
    },
    {
      refreshDeps: [apiHost, apiKey, open],
      onError: (error) => {
        message.error(`获取模型失败，请检查 API Host 和 API Key\n${error.message}`)
      },
    },
  )

  const modelOptions = useMemo(() => {
    return models?.map(model => ({ label: model.id, value: model.id }))
  }, [models])

  function onOk() {
    form.validateFields().then((values) => {
      console.log('values => ', values)
      setConfig(values)
      onClose?.()
    })
  }

  return (
    <Modal open={open} title="设置" onOk={onOk} onCancel={onClose} okText="保存" cancelText="取消">
      <Form requiredMark form={form} layout="vertical" initialValues={config}>
        <Form.Item label="API Host" name="apiHost" rules={apiHostRules}>
          <Input />
        </Form.Item>
        <Form.Item label="API Key" name="apiKey" rules={[CommonRules]}>
          <Input.Password />
        </Form.Item>
        <Form.Item label="Model" name="model" rules={[CommonRules]}>
          <SelectHoc
            showSearch
            onRefresh={refresh}
            loading={loading}
            options={modelOptions}
            placeholder="请选择模型"
            allowClear
          />
        </Form.Item>
        <Form.Item
          label="Temperature"
          name="temperature"
          help={<TemperatureHelp />}
        >
          <Slider
            min={0}
            max={2}
            step={0.1}
            tooltip={{ zIndex: 1001 }}
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
