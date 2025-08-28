import type { ChatFeatures, IAttachment, IImage } from '@ant-chat/shared'
import type { UploadFile } from 'antd'

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
import { setOnlieSearch, useChatSttingsStore } from '@/store/chatSettings'
import { useConversationsStore } from '@/store/conversation'
import { useMessagesStore } from '@/store/messages'
import { fileToBase64 } from '@/utils'
import SwitchButton from '../SwitchButton'
import MCPManagementPanel from './MCPManagementPanel'

interface SenderProps {
  actions?: React.ReactNode
  onSubmit?: (message: string, images: IImage[], attachments: IAttachment[], features: ChatFeatures) => void
  onCancel?: () => void
}

function Sender({ actions, ...props }: SenderProps) {
  const { message } = App.useApp()
  const [text, setText] = useState('')
  const [openHeader, setOpenHeader] = useState(false)
  const [attachmentList, setAttachmentList] = useState<UploadFile[]>([])
  const [rows, setRows] = useState(2)
  const hasMessage = useMessagesStore(state => !!state.messages.length)
  const loading = useConversationsStore(state => state.streamingConversationIds.has(state.activeConversationsId))

  // ============================ MCP、联网搜索 ============================
  const mcpEnabled = useChatSttingsStore(state => state.enableMCP)
  const onlineSearch = useChatSttingsStore(state => state.onlineSearch)

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
    props?.onSubmit?.(text, images, attachments, { enableMCP: mcpEnabled, onlineSearch })
    setAttachmentList([])
    setText('')
    setOpenHeader(false)
    setRows(2)
  }

  return (
    <div
      className={`
        mx-auto w-full max-w-(--chat-width)
        ${hasMessage ? 'relative' : 'absolute right-2 bottom-[50%] left-2'}
        overflow-hidden rounded-xl border-2 border-solid border-[#0000001a] bg-white p-3 shadow-lg
        transition duration-500
        focus-within:border-(--ant-color-primary) focus-within:shadow-(--ant-box-shadow-secondary)
        dark:border-[#fff6] dark:bg-[var(--ant-layout-color-bg-body)]
      `}
    >
      <div className={`
        h-0 overflow-hidden transition-[height]
        ${openHeader && 'h-25'}
      `}
      >
        {
          openHeader && (
            <div data-testid="header-content">
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
      <div>
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
            h-full w-full resize-none border-none bg-transparent p-1 placeholder-[#b4b4b4]
            outline-none
            dark:text-[var(--ant-layout-color-text-body)]
            dark:placeholder-[var(--ant-layout-color-text-body)]
          `}
        />
      </div>
      <div className="flex justify-between">
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
                checked={onlineSearch}
                onChange={setOnlieSearch}
                icon={<GlobalOutlined />}
              />
            </div>
          </Tooltip>
          <SwitchButton
            checked={mcpEnabled}
            icon={<Icon component={MCPIcon} />}
            popoverContent={<MCPManagementPanel />}
          />
          {actions}
        </div>
        <div className="flex items-center gap-1">
          <Button
            disabled={!allowSpeech}
            type="text"
            shape="circle"
            icon={recording ? <StopSvg className="h-8 w-8 text-(--ant-color-primary)!" /> : <AudioOutlined />}
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
                  <StopSvg className="h-8 w-8 !text-(--ant-color-primary)" />
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

export default Sender
