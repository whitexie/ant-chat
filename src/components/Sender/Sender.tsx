import type { IAttachment, IImage } from '@/db/interface'
import type { ChatFeatures } from '@/services-provider/interface'
import type { UploadFile } from 'antd'
import StopSvg from '@/assets/images/stop.svg?react'
import { useConversationsStore } from '@/store/conversation'
import { useFeatures, useFeaturesState } from '@/store/features'
import { fileToBase64 } from '@/utils'
import {
  ArrowUpOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  LinkOutlined,
} from '@ant-design/icons'
import { Attachments } from '@ant-design/x'
import { App, Badge, Button, Tooltip } from 'antd'
import { useRef, useState } from 'react'
import SwitchButton from '../SwitchButton'
import styles from './style.module.scss'

interface SenderProps {
  loading?: boolean
  onSubmit?: (message: string, images: IImage[], attachments: IAttachment[], features: ChatFeatures) => void
  onCancel?: () => void
}

function Sender({ loading = false, ...props }: SenderProps) {
  const { message } = App.useApp()
  const [text, setText] = useState('')
  const [openHeader, setOpenHeader] = useState(false)
  const [attachmentList, setAttachmentList] = useState<UploadFile[]>([])
  const [rows, setRows] = useState(2)
  const containerRef = useRef<HTMLDivElement>(null)
  const hasMessage = useConversationsStore(state => !!state.messages.length)
  const features = useFeaturesState()
  const { setOnlieSearch } = useFeatures()

  async function handleSubmit() {
    const { images, attachments } = await transformAttachments()
    props?.onSubmit?.(text, images, attachments, features)
    setAttachmentList([])
    setText('')
    setOpenHeader(false)
    setRows(2)
  }

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

  return (
    <div ref={containerRef} className="sender-container">
      <div
        className={`${styles.sender} absolute left-2 right-2 ${hasMessage ? 'bottom-2' : 'bottom-50%'} transition transition-duration-500 p-xs bg-white dark:(bg-[var(--ant-layout-color-bg-body)] border-white/40) rounded-xl overflow-hidden shadow-lg`}
      >
        <div className={`header transition-height overflow-hidden h-0 ${openHeader && 'h-100px'}`}>
          <div className="title"></div>
          <div className="content">
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
        </div>
        <div className="input-wrapper">
          <textarea
            value={text}
            rows={rows}
            onChange={(e) => {
              const value = e.target.value
              setText(value)
              const length = value.split('\n').length
              if (length > 2) {
                setRows(length < 6 ? length : 6)
              }
            }}
            onKeyDown={async (e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                await handleSubmit()
                setText('')
                setRows(2)
              }
            }}
            placeholder="Enter发送消息，Shift+Enter换行"
            className="w-full h-full scrollbar border-none p-1 outline-none resize-none placeholder-[#b4b4b4] text-size-base dark:(bg-[var(--ant-layout-color-bg-body)] text-[var(--ant-layout-color-text-body)] placeholder-[var(--ant-layout-color-text-body)])"
          />
        </div>
        <div className="footer flex justify-between">
          <div className="flex gap-1">
            <Tooltip title="附件(支持文档与图片)">
              <Badge dot={(attachmentList.length > 0) && !openHeader}>
                <Button
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
                  checked={features.onlieSearch}
                  onChange={setOnlieSearch}
                  icon={<GlobalOutlined />}
                />
              </div>
            </Tooltip>
          </div>
          <div>
            <Button
              type={loading ? 'text' : 'primary'}
              shape={loading ? 'default' : 'circle'}
              disabled={text.length === 0 && !loading}
              icon={loading ? <StopSvg className="w-8 h-8 color-[var(--ant-color-primary)]!" /> : <ArrowUpOutlined />}
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
    </div>
  )
}

export default Sender
