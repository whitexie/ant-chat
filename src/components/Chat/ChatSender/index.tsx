import { useToken } from '@/utils'
import { PictureOutlined } from '@ant-design/icons'
import { Sender } from '@ant-design/x'
import { Button } from 'antd'
import { useState } from 'react'
import ImageUpload from './ImageUpload'

interface ChatSenderProps {
  loading: boolean
  onSubmit: (message: string, images: API.IImage[]) => void
}
export default function ChatSender({ loading, onSubmit }: ChatSenderProps) {
  const { token } = useToken()
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [images, setImages] = useState<API.IImage[]>([])

  const prefix = (
    <div className="flex items-center h-full gap-1">
      <Button type="text" icon={<PictureOutlined />} onClick={() => setOpen(!open)} />
    </div>
  )

  const headerNode = (
    <Sender.Header
      style={{
        backgroundColor: token.colorBgContainer,
      }}
      title="图片"
      open={open}
      onOpenChange={setOpen}
    >
      <div className="max-h-xl overflow-y-auto">
        <ImageUpload items={images} onChange={setImages} />
      </div>
    </Sender.Header>
  )

  return (
    <div className="absolute left-2 right-2 bottom-2 max-w-4xl">
      <Sender
        value={message}
        header={headerNode}
        prefix={prefix}
        onChange={setMessage}
        loading={loading}
        placeholder="按回车发送，Shift + 回车 换行"
        onSubmit={(message) => {
          onSubmit(message, images)
          setMessage('')
          setImages([])
          setOpen(false)
        }}
      />
    </div>
  )
}
