import { Typography } from 'antd'

import markdownit from 'markdown-it'

const md = markdownit({ html: true, breaks: true })

interface RenderMarkdownProps {
  content: string
}
export default function RenderMarkdown({ content }: RenderMarkdownProps) {
  return (
    <Typography>
      {/* eslint-disable-next-line react-dom/no-dangerously-set-innerhtml */}
      <div dangerouslySetInnerHTML={{ __html: md.render(content) }} />
    </Typography>
  )
}
