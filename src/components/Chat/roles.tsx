import type { BubbleListProps } from '@ant-design/x/es/bubble/BubbleList'
import type { GetProp } from 'antd'
import { Role } from '@/constants'
import { UserOutlined } from '@ant-design/icons'
import MessageContent from './MessageContent'
import RenderMarkdown from './RenderMarkdown'

export const roles: GetProp<BubbleListProps, 'roles'> = {
  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#69b1ff' } },
    style: {
      marginInlineEnd: 44,
      marginInlineStart: 10,
    },
    messageRender: content => typeof content === 'string' ? <RenderMarkdown content={content} /> : content,
  },
  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    style: {
      marginInlineEnd: 10,
      marginInlineStart: 44,
    },
    // @ts-expect-error 类型错误
    messageRender: (message: ChatMessage) => <MessageContent content={message} />,
  },
}
