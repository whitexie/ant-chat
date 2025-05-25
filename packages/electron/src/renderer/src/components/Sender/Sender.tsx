import type { IAttachment, IImage } from '@ant-chat/shared'
import type { UploadFile } from 'antd'
import type { ChatFeatures } from '@/services-provider/interface'
import Icon, {
  ArrowUpOutlined,
  AudioOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { Attachments } from '@ant-design/x'
import useSpeech from '@ant-design/x/es/sender/useSpeech'
import { App, Badge, Button, Tooltip } from 'antd'
import { useState } from 'react'
import MCPIcon from '@/assets/icons/mcp.svg?react'
import StopSvg from '@/assets/icons/stop.svg?react'
import { useFeatures, useFeaturesState } from '@/store/features'
import { useMessagesStore } from '@/store/messages'
import { fileToBase64 } from '@/utils'
import SwitchButton from '../SwitchButton'

interface SenderProps {
  loading?: boolean
  actions?: React.ReactNode
  onSubmit?: (message: string, images: IImage[], attachments: IAttachment[], features: ChatFeatures) => void
  onCancel?: () => void
}

function Sender({ loading = false, actions, ...props }: SenderProps) {
  const { message } = App.useApp()
  const [text, setText] = useState('')
  const [openHeader, setOpenHeader] = useState(false)
  const [attachmentList, setAttachmentList] = useState<UploadFile[]>([])
  const [rows, setRows] = useState(2)
  const hasMessage = useMessagesStore(state => !!state.messages.length)
  const features = useFeaturesState()
  const { setOnlieSearch, setEnableMCP } = useFeatures()
  // 新增输入法状态
  const [isComposing, setIsComposing] = useState(false)

  const [allowSpeech, triggerSpeech, recording] = useSpeech((transcript: string) => {
    setText(prev => `${prev}${transcript}`)
  })

  async function transformAttachments() {
    const images: IAttachment[] = []
    const attachments: IAttachment[] = []

    if (attachmentList.length) {
      for (const item of attachmentList) {
        const { originFileObj, uid, name, type, size } = item as Required<UploadFile>
        const data = await fileToBase64(originFileObj)
        const result = { uid, name, size, type, data }
        if (type.includes('image')) {
          images.push(result)
        }
        else {
          attachments.push(result)
        }
      }
    }

    return { images, attachments }
  }

  async function handleSubmit() {
    const { images, attachments } = await transformAttachments()
    props?.onSubmit?.(text, images, attachments, features)
    setAttachmentList([])
    setText('')
    setOpenHeader(false)
    setRows(2)
  }

  return (
    <div
      className={`
        w-(--chat-width) mx-auto
        ${hasMessage ? 'relative' : 'absolute left-2 right-2 bottom-[50%]'} 
        transition transition-duration-500 p-3 
        bg-white dark:bg-[var(--ant-layout-color-bg-body)]
        border-solid border-2 border-[#0000001a] dark:border-[#fff6]
        rounded-xl overflow-hidden shadow-lg
        focus-within:border-(--ant-color-primary) focus-within:shadow-(--ant-box-shadow-secondary)
      `}
    >
      <div className={`header transition-height overflow-hidden h-0 ${openHeader && 'h-25'}`}>
        {
          openHeader && (
            <div data-testid="header-content" className="content">
              <Attachments
                multiple
                overflow="scrollX"
                beforeUpload={() => false}
                items={attachmentList}
                onChange={({ fileList }) => {
                  const result: UploadFile[] = []
                  fileList.forEach((item) => {
                    if (item.size && item.size > 1024 * 1024 * 20) {
                      message.warning('文件大小不能超过20MB')
                      return
                    }

                    // 识别Markdown文件
                    if (item.name.toLowerCase().endsWith('.md')) {
                      item.type = 'text/md'
                    }

                    result.push(item)
                  })

                  setAttachmentList(result)
                }}
                placeholder={{
                  icon: <CloudUploadOutlined />,
                  title: '上传图片或文档',
                }}
                accept="image/*,application/pdf,text/*,.md,.mp4"
              />
            </div>
          )
        }
      </div>
      <div className="input-wrapper">
        <textarea
          data-testid="textarea"
          value={text}
          rows={rows}
          onCompositionStart={() => setIsComposing(true)} // 输入法开始
          onCompositionEnd={() => setIsComposing(false)} // 输入法结束
          onChange={(e) => {
            const value = e.target.value
            setText(value)
            const length = value.split('\n').length
            if (length > 2 || rows > 2) {
              setRows(length < 6 ? length : 6)
            }
          }}
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && !e.shiftKey && text.length > 0 && !isComposing) {
              e.preventDefault()
              await handleSubmit()
            }
          }}
          placeholder="Enter发送消息，Shift+Enter换行"
          className={`
            w-full h-full bg-transparent border-none p-1 outline-none resize-none 
            placeholder-[#b4b4b4] 
            dark:text-[var(--ant-layout-color-text-body)]  dark:placeholder-[var(--ant-layout-color-text-body)]`}
        />
      </div>
      <div className="footer flex justify-between">
        <div className="flex gap-1">
          <Tooltip title="附件(支持文档与图片)">
            <Badge dot={(attachmentList.length > 0) && !openHeader}>
              <Button
                data-testid="toggle-header"
                onClick={() => {
                  setOpenHeader(!openHeader)
                }}
                icon={<LinkOutlined />}
              />
            </Badge>
          </Tooltip>
          <Tooltip title="联网搜索(目前仅Gemini支持)">
            <div>
              <SwitchButton
                dataTestId="onlineSearch"
                checked={features.onlineSearch}
                onChange={setOnlieSearch}
                icon={<GlobalOutlined />}
              />
            </div>
          </Tooltip>
          <Tooltip title="MCP(token消耗较大)">
            <div>
              <SwitchButton
                checked={features.enableMCP}
                onChange={setEnableMCP}
                icon={<Icon component={MCPIcon} />}
              />
            </div>
          </Tooltip>
          {actions}
        </div>
        <div className="flex gap-1 items-center">
          <Button
            disabled={!allowSpeech}
            type="text"
            shape="circle"
            icon={recording ? <StopSvg className="w-8 h-8 color-[var(--ant-color-primary)]!" /> : <AudioOutlined />}
            onClick={() => {
              if (allowSpeech) {
                triggerSpeech(recording)
              }
            }}
          />
          <Button
            data-testid="sendBtn"
            type={loading ? 'text' : 'primary'}
            shape={loading ? 'default' : 'circle'}
            disabled={text.length === 0 && !loading}
            icon={loading
              ? (
                  <StopSvg className="w-8 h-8 !text-(--ant-color-primary)" />
                )
              : <ArrowUpOutlined />}
            onClick={
              () => {
                if (loading) {
                  props.onCancel?.()
                  return
                }
                handleSubmit()
              }
            }
          />
        </div>
      </div>
    </div>
  )
}

// function checkModel(model: AllAvailableModelsSchema['models'][number] | null) {
//   return !!model
// }

// function checkProviderServiceConfig(provider: AllAvailableModelsSchema) {
//   if (!provider.apiKey) {
//     return [false, 'apiKey 未配置']
//   }

//   if (!provider.baseUrl) {
//     return [false, 'baseUrl 未配置']
//   }

//   if (!provider.models.length) {
//     return [false, '该提供商下没有可用的模型']
//   }

//   return [true, '']
// }

export default Sender
