import type { IAttachment, IImage } from '@/db/interface'
import type { AttachmentsProps } from '@ant-design/x'
import type { GetProp, GetRef } from 'antd'
import type { UploadFile } from 'antd/lib'
import { fileToBase64, useToken } from '@/utils'
import { CloudUploadOutlined, LinkOutlined } from '@ant-design/icons'
import { Attachments, Sender } from '@ant-design/x'
import { Badge, Button } from 'antd'
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
  const senderRef = useRef<GetRef<typeof Sender>>(null)

  const headerNode = (
    <Sender.Header
      style={{
        backgroundColor: token.colorBgContainer,
      }}
      title="附件"
      open={open}
      onOpenChange={setOpen}
    >
      <Attachments
        beforeUpload={() => false}
        items={attachmentList}
        onChange={({ fileList }) => {
          console.log('fileList chagned => ')
          setAttachmentList(fileList)
        }}
        placeholder={type =>
          type === 'drop'
            ? {
                title: 'Drop file here',
              }
            : {
                icon: <CloudUploadOutlined />,
                title: '上传文件',
                description: '单击或将文件拖到此区域以上传',
              }}
        getDropContainer={() => senderRef.current?.nativeElement}
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
