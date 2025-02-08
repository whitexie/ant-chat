import { useModelConfigStore } from '@/store/modelConfig'
import { PlusOutlined } from '@ant-design/icons'
import { App, Button, Divider, Form, Input, Select, Space } from 'antd'
import { useState } from 'react'
import { useShallow } from 'zustand/shallow'

interface ProviderDropdownProps {
  value: ModelConfigMappingKey
  onChange: (value: ModelConfigMappingKey) => void
}

export default function ProviderDropdown(props: ProviderDropdownProps) {
  const { message } = App.useApp()
  const [providerName, setProviderName] = useState('')
  const { configMapping } = useModelConfigStore(useShallow((state) => {
    return {
      configMapping: state.configMapping,
    }
  }))

  const options = Object.entries(configMapping).map(([key, value]) => ({
    label: value.name,
    value: key,
  }))

  function addItem() {
    // TODO 添加自定义提供商
    message.error('功能开发中...')
  }

  return (
    <Form.Item label="模型提供方">
      <Select
        value={props.value}
        options={options}
        onSelect={(value) => {
          props.onChange(value)
        }}
        className="w-40"
        dropdownRender={menu => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Space>
              <Input
                placeholder="请输入提供商名称"
                value={providerName}
                onChange={e => setProviderName(e.target.value)}
                onKeyDown={e => e.stopPropagation()}
                style={{ width: '100%' }}
              />
              <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
                自定义提供商
              </Button>
            </Space>
          </>
        )}

      />

    </Form.Item>
  )
}
