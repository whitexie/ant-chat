import type { BubbleContent } from '@/types/global'
import RenderMarkdown from '@/components/RenderMarkdown'
import { Attachments } from '@ant-design/x'
import { Image } from 'antd'

// 提取消息渲染逻辑到独立组件
export default function MessageContent({ content, images, attachments }: BubbleContent) {
  return (
    <div>
      <RenderMarkdown content={content} />
      {
        images.length > 0 && (
          <>
            <hr className="mt-1" />
            <div className="flex flex-wrap gap-2 pt-2">
              {
                images.map(item => <Image width={100} height={100} className="object-contain border-solid border-1px border-gray-400/20 rounded-md" src={item.data} key={item.uid} alt={item.name} />)
              }
            </div>
          </>
        )
      }
      {
        attachments.map(item => (
          <div key={item.uid} className="pt-2">
            <Attachments.FileCard item={item} />
          </div>
        ))
      }
    </div>
  )
}
