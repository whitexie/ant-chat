import type { IAttachment, IImage } from '@/db/interface'
import type { AttachmentsProps } from '@ant-design/x'
import type { GetProp, GetRef } from 'antd'
import type { UploadFile } from 'antd/lib'
import { fileToBase64, useToken } from '@/utils'
import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons'
import { Attachments, Sender } from '@ant-design/x'
import { App, Badge, Button } from 'antd'
import { useRef, useState } from 'react'

interface ChatSenderProps {
  loading: boolean
  onSubmit: (message: string, images: IImage[], attachments: IAttachment[]) => void
  onCancel?: () => void
}

export default function ChatSender({ loading, onSubmit, onCancel }: ChatSenderProps) {
  const [attachmentList, setAttachmentList] = useState<GetProp<AttachmentsProps, 'items'>>([])
  const { token } = useToken()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const { message: messageApi } = App.useApp()
  const senderRef = useRef<GetRef<typeof Sender>>(null)

  const radius = token.borderRadius * 2

  const headerNode = (
    <Sender.Header
      style={{
        borderRadius: `${radius}px ${radius}px 0px 0px`,
        backgroundColor: token.colorBgContainer,
      }}
      title="附件"
      open={open}
      onOpenChange={setOpen}
    >
      <Attachments
        multiple
        beforeUpload={() => false}
        items={attachmentList}
        onChange={({ fileList }) => {
          const result: UploadFile[] = []
          fileList.forEach((item) => {
            if (item.size && item.size > 1024 * 1024 * 20) {
              messageApi.warning('文件大小不能超过20MB')
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
        placeholder={type =>
          type === 'drop'
            ? {
                title: 'Drop file here',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传图片或文档',
                description: '单击或将文件拖到此区域以上传(文档仅支持PDF、Markdown)',
              }}
        getDropContainer={() => senderRef.current?.nativeElement}
        accept="image/*,application/pdf,text/*,.md,.mp4"
      />
    </Sender.Header>
  )

  async function handleSubmit(message: string) {
    const { images, attachments } = await transformAttachments()
    onSubmit(message, images, attachments)
    setAttachmentList([])
    setMessage('')
    setOpen(false)
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
    <div
      className="absolute left-2 right-2 bottom-2 max-w-4xl"
      style={{
        backgroundColor: token.colorBgContainer,
        borderRadius: 'calc(var(--ant-border-radius) * 2)',
      }}
    >
      <Sender
        ref={senderRef}
        value={message}
        header={headerNode}
        prefix={(
          <Badge dot={(attachmentList.length > 0) && !open}>
            <Button onClick={() => setOpen(!open)} icon={<LinkOutlined />} />
          </Badge>
        )}
        onChange={setMessage}
        loading={loading}
        placeholder="按回车发送，Shift + 回车 换行"
        onSubmit={handleSubmit}
        onCancel={onCancel}
      />
    </div>
  )
}
