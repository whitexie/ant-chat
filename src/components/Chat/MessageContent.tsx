import type { IMessageContent } from '@/db/interface'
import RenderMarkdown from '@/components/RenderMarkdown'
import React from 'react'

// 提取消息渲染逻辑到独立组件
export default function MessageContent({ content }: { content: IMessageContent }) {
  if (typeof content === 'string') {
    return (
      <RenderMarkdown content={content} />
    )
  }

  const images = content.filter(item => item.type === 'image_url')
  const _content = content.filter(item => item.type === 'text').reduce((a, b) => {
    return `${a}${b.text}`
  }, '')

  return (
    <div>
      {images.length > 0 && (
        <>
          <div className="flex gap-1 overflow-x-auto">
            {images.map(item => (
              <img
                key={item.image_url.uid}
                className="object-contain border-solid border-gray-100 rounded-md"
                src={item.image_url.url}
                alt={item.image_url.name}
                width={100}
                height={100}
                loading="lazy"
              />
            ))}
          </div>
          <hr className="my-2" />
        </>
      )}
      <React.Suspense>
        <RenderMarkdown content={_content} />
      </React.Suspense>
    </div>
  )
}
