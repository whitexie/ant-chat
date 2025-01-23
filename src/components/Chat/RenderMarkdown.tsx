import { Typography } from 'antd'
import Markdown from 'react-markdown'

interface RenderMarkdownProps {
  content: string
}
export default function RenderMarkdown({ content }: RenderMarkdownProps) {
  return (
    <Typography>
      <Markdown>
        {content}
      </Markdown>
    </Typography>
  )
}
