import type { ModelConfig } from '@/db/interface'
import type { IModel } from '@/services-provider/interface'
import type { InputRef, SelectProps } from 'antd'
import { getProviderDefaultApiHost, getProviderModels } from '@/services-provider'
import { useModelConfigStore } from '@/store/modelConfig'
import { ReloadOutlined } from '@ant-design/icons'
import { App, Button, Form, Input, Select, Slider } from 'antd'
import { debounce } from 'lodash-es'
import { Suspense, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react'
import { useShallow } from 'zustand/shallow'

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
  initialValues: ModelConfig | null
  header?: React.ReactNode
  children?: React.ReactNode
  showReset?: boolean
  ref?: React.RefObject<ModelSettingsFormInstance | null>
  onProviderChange?: (value: string) => void
  onReset?: () => void
}

export interface ModelSettingsFormInstance {
  getValues: () => ModelConfig | null
  validateFields: () => Promise<ModelConfig | null>
  resetFields: () => void
}

export default function ModelSettingsForm({ header, ref, showReset, ...props }: SettingsModalProps) {
  const [form] = Form.useForm<ModelConfig | null>()
  const { message } = App.useApp()
  const [modelName, setModelName] = useState('')
  const [models, setModels] = useState<IModel[]>([])
  const [loading, setLoading] = useState(false)
  const modelInputRef = useRef<InputRef>(null)

  const initialValues = props.initialValues // ?? defaultModelConfig

  const apiHost = Form.useWatch('apiHost', form)
  const apiKey = Form.useWatch('apiKey', form)

  const { configMapping } = useModelConfigStore(useShallow((state) => {
    return {
      configMapping: state.configMapping,
    }
  }))

  const options = Object.entries(configMapping).map(([key, value]) => ({
    label: value.name,
    value: key,
  }))

  const providerLabel = (
    <div className="flex w-full items-center gap-4">
      <span>提供商</span>
      {
        (showReset && !!form.getFieldValue('id')) && (
          <span
            className="text-[12px] text-amber-400 hover:text-amber-600 cursor-pointer"
            onClick={() => {
              props.onReset?.()
              form.resetFields()
            }}
          >
            重置为全局设置
          </span>
        )
      }
    </div>
  )

  const modelOptions = useMemo(() => {
    return models?.map(model => ({ label: model.id, value: model.id }))
  }, [models])

  const initModelsDebounce = useCallback(debounce(_initModels, 1000), [])

  async function handleRefreshModels() {
    if (!apiHost || !apiKey) {
      console.log('no apiHost or apiKey')
      return
    }
    await initModelsDebounce(apiHost, apiKey)
  }

  async function _initModels(apiHost: string, apiKey: string) {
    const _active = form.getFieldValue('id')
    if (!_active) {
      console.debug('no active', _active, apiHost, apiKey)
      return
    }
    try {
      setModels([])
      setLoading(true)
      const models = await getProviderModels(_active, apiHost, apiKey)
      setModels(models)
    }
    catch (e) {
      const error = e as Error
      message.error(`获取模型失败，请检查 API Host 和 API Key\n${error.message}`)
    }
    finally {
      setLoading(false)
    }
  }

  function onProviderChange(value: string) {
    const apiHost = getProviderDefaultApiHost(value)
    form.setFieldsValue({ apiHost })
    props.onProviderChange?.(value)
  }

  useImperativeHandle(ref, () => ({
    getValues: () => form.getFieldsValue(),
    validateFields: () => form.validateFields(),
    resetFields: () => form.resetFields(),
  }))

  useEffect(() => {
    if (initialValues?.id && initialValues?.apiHost && initialValues?.apiKey) {
      initModelsDebounce(initialValues.apiHost, initialValues.apiKey)
    }
  }, [])

  return (
    <Form requiredMark form={form} layout="vertical" initialValues={initialValues || undefined}>
      {header}
      <Form.Item label={providerLabel} name="id">
        <Select
          options={options}
          onChange={onProviderChange}
        />
      </Form.Item>
      <Form.Item label="API Host" name="apiHost" rules={apiHostRules}>
        <Input type="text" onBlur={handleRefreshModels} />
      </Form.Item>
      <Form.Item label="API Key" name="apiKey" rules={[CommonRules]}>
        <Input.Password onBlur={handleRefreshModels} />
      </Form.Item>
      <Form.Item label="Model" name="model" rules={[CommonRules]}>
        <SelectHoc
          showSearch
          onRefresh={handleRefreshModels}
          loading={loading}
          options={modelOptions}
          placeholder="请选择模型"
          allowClear
          dropdownRender={(menu) => {
            return (
              <div>
                {menu}
                <div>
                  <Input
                    value={modelName}
                    ref={modelInputRef}
                    placeholder="请输入模型"
                    onChange={(e) => {
                      setModelName(e.target.value)
                    }}
                    onPressEnter={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      const value = e.currentTarget.value
                      setModels(prev => [...prev, { id: value, name: value, object: 'model', owned_by: 'user' }])

                      modelInputRef.current?.blur()
                      form.setFieldValue('model', value)
                      setModelName('')
                    }}
                  />
                </div>

              </div>
            )
          }}
        />
      </Form.Item>
      <Form.Item label="Temperature" name="temperature">
        <Slider
          min={0}
          max={2}
          step={0.1}
          tooltip={{ zIndex: 1001 }}
          marks={{
            0: <span className="text-2.5">准确</span>,
            1: <span className="text-2.5">平衡</span>,
            2: <span className="text-2.5">创意</span>,
          }}
        />
      </Form.Item>
      {props.children}
    </Form>
  )
}
