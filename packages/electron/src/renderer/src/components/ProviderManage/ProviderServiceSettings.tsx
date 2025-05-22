import type { ProviderServiceSchema, UpdateProviderServiceSchema } from '@ant-chat/shared'
import { Form, Input } from 'antd'
import { ModelList } from '@/components/ProviderManage/ModelList/ModelList'
import { AI_OFFICIAL_API_INFO } from '@/constants'

export interface ProviderServiceSettingsProps {
  item: ProviderServiceSchema | null
  onChange?: (e: UpdateProviderServiceSchema) => void
}

export function ProviderServiceSettings({ item, onChange }: ProviderServiceSettingsProps) {
  if (!item) {
    return null
  }

  const officialApiUrl = getOfficialApiUrl(item.id)
  const officialKeyUrl = getOfficialKeyUrl(item.id)

  return (
    <div className="p-3 flex-1 h-[100dvh] overflow-y-auto">
      <Form layout="vertical" className="flex flex-col gap-4" initialValues={item}>
        <Form.Item
          label={<span className="font-medium">API URL</span>}
          name="baseUrl"
          help={
            officialApiUrl
            && (
              <div className="text-xs mt-1">
                官方URL:
                {' '}
                {officialApiUrl}
              </div>
            )
          }
        >
          <Input
            onBlur={(e) => {
              onChange?.({ id: item.id, baseUrl: e.target.value })
            }}
          />
        </Form.Item>

        <Form.Item
          label={<span className="font-medium">API Key</span>}
          name="apiKey"
          help={officialKeyUrl
            && (
              <a
                className="text-xs mt-1"
                href={officialKeyUrl}
              >
                获取API Key
              </a>
            )}
        >
          <Input.Password
            visibilityToggle={false}
            onBlur={(e) => {
              onChange?.({ id: item.id, apiKey: e.target.value })
            }}
          />
        </Form.Item>

        <Form.Item label={<span className="font-medium">模型列表</span>}>
          <ModelList providerServiceId={item.id} />
        </Form.Item>
      </Form>
    </div>
  )
}

export function getOfficialApiUrl(provider: string) {
  if (provider in AI_OFFICIAL_API_INFO) {
    return AI_OFFICIAL_API_INFO[provider].url
  }

  return null
}

export function getOfficialKeyUrl(provider: string) {
  if (provider in AI_OFFICIAL_API_INFO) {
    return AI_OFFICIAL_API_INFO[provider].keyUrl
  }

  return null
}
