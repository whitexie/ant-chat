import type { BubbleContent } from '@/types/global'
import { ReloadOutlined } from '@ant-design/icons'
import { Attachments } from '@ant-design/x'
import { Collapse, Image, Typography } from 'antd'
import RenderMarkdown from '@/components/RenderMarkdown/RenderMarkdown'

// 提取消息渲染逻辑到独立组件
export default function MessageContent({ content = '', images = [], attachments = [], reasoningContent = '', status }: Partial<BubbleContent>) {
  if (status === 'error') {
    return (
      <>
        <Typography.Paragraph>
          <Typography.Text type="danger">请求失败，请检查配置是否正确</Typography.Text>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <Typography.Text type="danger">{content}</Typography.Text>
        </Typography.Paragraph>
      </>
    )
  }
  const items = [
    {
      key: '1',
      label: content
        ? 'Thinking...'
        : (
            <span>
              思考中...
              <ReloadOutlined spin className="ml-1" />
            </span>
          ),
      children: (
        <div className="relative pl-4">
          <div className="absolute left-0 h-full top-0 w-1 bg-gray-400/20"></div>
          <p className="whitespace-pre-wrap text-xs">{reasoningContent}</p>
        </div>
      ),
      styles: {
        header: {
          alignItems: 'center',
          padding: '4px',
          fontSize: '12px',
          lineHeight: '16px',
        },
      },
    },
  ]
  return (
    <div>
      {
        reasoningContent && (
          <Collapse items={items} defaultActiveKey={['1']} size="small" />
        )
      }
      <RenderMarkdown content={content || ''} />
      {
        images.length > 0 && (
          <>
            <hr className="mt-1" />
            <div className="flex gap-2 flex-wrap pt-2">
              {
                images.map(item => <Image width={100} height={100} className="border-1px object-contain border-solid border-gray-400/20 rounded-md" src={item.data} key={item.uid} alt={item.name} />)
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
