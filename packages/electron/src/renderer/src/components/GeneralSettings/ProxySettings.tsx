import { Button, Input, message, Select } from 'antd'
import React from 'react'

const proxyOptions = [
  { value: 'none', label: '不使用代理' },
  { value: 'system', label: '系统代理' },
  { value: 'custom', label: '自定义代理' },
]

interface ProxySettingsProps {
  onModeChange: (mode: 'none' | 'system' | 'custom') => void
}

export function ProxySettings({ onModeChange }: ProxySettingsProps) {
  return (
    <Select
      defaultValue="none"
      onChange={onModeChange}
      options={proxyOptions}
      className="min-w-32"
    />
  )
}

// 自定义代理URL配置组件
export function CustomProxyUrl() {
  const [proxyUrl, setProxyUrl] = React.useState('')
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState<boolean | null>(null)

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProxyUrl(e.target.value)
  }

  const handleTestProxy = async () => {
    if (!proxyUrl) {
      message.warning('请先配置代理地址')
      return
    }

    // 验证URL必须包含协议头
    if (!proxyUrl.includes('://')) {
      message.error('代理地址必须包含协议头，例如：http://127.0.0.1:7890')
      return
    }

    setTesting(true)
    try {
      // 模拟测试连接
      await new Promise(resolve => setTimeout(resolve, 2000))

      // 模拟测试结果
      const result = Math.random() > 0.3 // 70% 成功率

      setTestResult(result)
      message[result ? 'success' : 'error'](
        result ? '代理连接成功' : '代理连接失败',
      )
    }
    catch {
      setTestResult(false)
      message.error('代理测试失败')
    }
    finally {
      setTesting(false)
    }
  }

  const isValidProxyUrl = proxyUrl.includes('://')

  return (
    <div className="flex items-center gap-2">
      <Input
        value={proxyUrl}
        onChange={handleUrlChange}
        placeholder="http://127.0.0.1:7890"
        className="flex-1"
      />
      {isValidProxyUrl && (
        <Button
          type="primary"
          onClick={handleTestProxy}
          loading={testing}
        >
          {testing ? '测试中...' : '测试连接'}
        </Button>
      )}
      {testResult !== null && (
        <span style={{ color: testResult ? '#52c41a' : '#ff4d4f' }}>
          {testResult ? '✓' : '✗'}
        </span>
      )}
    </div>
  )
}
