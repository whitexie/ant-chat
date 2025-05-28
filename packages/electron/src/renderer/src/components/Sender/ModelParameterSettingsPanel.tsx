import { Input, Slider } from 'antd'

export function ModelParameterSettingsPanel() {
  return (
    <div className="w-80 p-2 px-4">
      <div className="text-sm text-gray-500 mb-2">
        模型设置
      </div>
      <div className="form">
        <FormItem label="系统提示词">
          <Input.TextArea />
        </FormItem>
        <FormItem label="模型温度">
          <Slider
            min={0}
            max={2}
            tooltip={{ open: true, placement: 'bottom' }}
            step={0.1}
          />
        </FormItem>
        <FormItem label="maxTokens">
          <Slider
            defaultValue={4000}
            min={1000}
            max={8000}
            tooltip={{ open: true, placement: 'bottom' }}
            step={1000}
          />
        </FormItem>
      </div>
    </div>
  )
}

export function FormItem({ label, children }: { label: string, children?: React.ReactNode }) {
  return (
    <div className="form-item py-2">
      <div className="form-item-label text-sm py-1">
        {label}
      </div>
      <div className="form-item-content">
        {children}
      </div>
    </div>
  )
}
