import type { FormInstance, SelectProps } from 'antd'
import { getModels } from '@/api'
import { ReloadOutlined } from '@ant-design/icons'
import { useRequest } from 'ahooks'
import { App, Button, Form, Input, Select, Slider } from 'antd'
import { forwardRef, Suspense, useImperativeHandle, useMemo } from 'react'

function TemperatureHelp() {
  return (
    <span className="text-3 block">
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
  initialValues: ModelConfig
  header?: React.ReactNode
  children?: React.ReactNode
}

export default forwardRef<FormInstance, SettingsModalProps>(({ initialValues, header, children }, ref) => {
  const [form] = Form.useForm<ModelConfig>()
  const { message } = App.useApp()

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
      debounceWait: 300,
      // manual: true,
      refreshDeps: [apiHost, apiKey, open],
      onError: (error) => {
        message.error(`获取模型失败，请检查 API Host 和 API Key\n${error.message}`)
      },
    },
  )

  const modelOptions = useMemo(() => {
    return models?.map(model => ({ label: model.id, value: model.id }))
  }, [models])

  useImperativeHandle(ref, () => form)

  return (
    <Form requiredMark form={form} layout="vertical" initialValues={initialValues}>
      {header}
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

      {children}

      <div className="block pt-3">
        <Form.Item label="默认提示词" name="systemMessage">
          <Input.TextArea placeholder="创建新对话时默认的提示词" />
        </Form.Item>
      </div>
    </Form>
  )
})
