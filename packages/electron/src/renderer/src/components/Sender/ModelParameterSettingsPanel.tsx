import { Input, Slider } from 'antd'
import { useShallow } from 'zustand/react/shallow'
import PromptIcon from '@/assets/icons/prompt.svg?react'
import ReturnIcon from '@/assets/icons/return.svg?react'
import TemperatureIcon from '@/assets/icons/temperature.svg?react'
import { setMaxTokens, setSystemPrompt, setTemperature, useChatSttingsStore } from '@/store/chatSettings'

export function ModelParameterSettingsPanel() {
  const { systemPrompt, temperature, maxTokens, model } = useChatSttingsStore(useShallow(state => ({
    model: state.model,
    systemPrompt: state.systemPrompt,
    temperature: state.temperature,
    maxTokens: state.maxTokens,
  })))

  return (
    <div className="w-80 p-2 px-4">
      <div className="text-sm text-gray-500 mb-2">
        模型设置
      </div>
      <div className="form">
        <FormItem label="系统提示词" icon={<PromptIcon />}>
          <Input.TextArea value={systemPrompt} onChange={e => setSystemPrompt(e.target.value)} />
        </FormItem>
        <FormItem label="temperature" icon={<TemperatureIcon />}>
          <CustomSlider
            min={0}
            max={2}
            step={0.1}
            value={temperature}
            onChange={value => setTemperature(value)}
          />
        </FormItem>
        <FormItem label="maxTokens" icon={<ReturnIcon />}>
          <CustomSlider
            defaultValue={model?.maxTokens ?? 4096}
            min={1000}
            max={model?.maxTokens ?? 8000}
            formatter={value => `${Math.floor((value ?? 0) / 1000)}k`}
            step={1000}
            value={maxTokens}
            onChange={value => setMaxTokens(value)}
          />
        </FormItem>
      </div>
    </div>
  )
}

export function FormItem({ icon, label, children }: { icon?: React.ReactNode, label: string, children?: React.ReactNode }) {
  return (
    <div className="form-item py-2">
      <div className="form-item-label flex items-center gap-1 text-sm py-1">
        {icon}
        {label}
      </div>
      <div className="form-item-content">
        {children}
      </div>
    </div>
  )
}

interface CustomSliderProps {
  defaultValue?: number
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  formatter?: (value: number) => string
}

export function CustomSlider({ defaultValue, min, max, step, value, onChange, formatter }: CustomSliderProps) {
  return (
    <div className="relative">
      <div className="absolute top-0 right-0 translate-y-[-100%] text-xs">
        {formatter ? formatter(value) : value}
      </div>
      <Slider
        defaultValue={defaultValue}
        min={min}
        max={max}
        step={step}
        value={value}
        tooltip={{ open: false }}
        onChange={onChange}
      />
    </div>
  )
}
