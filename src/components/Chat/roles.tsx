import type { BubbleListProps } from '@ant-design/x/es/bubble/BubbleList'
import type { GetProp } from 'antd'
import { Role } from '@/constants'
import { RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { lazy, Suspense } from 'react'
import Loading from '../Loading'
import MessageContent from './MessageContent'

const RenderMarkdown = lazy(() => import('./RenderMarkdown'))

export const roles: GetProp<BubbleListProps, 'roles'> = {
  [Role.SYSTEM]: {
    placement: 'start',
    avatar: { icon: <SmileFilled size={14} />, style: { background: '#DE732D' } },
    style: {
      marginInlineEnd: 44,
      marginInlineStart: 10,
    },
    messageRender: content => typeof content === 'string'
      ? (
          <Suspense fallback={<Loading />}>
            <RenderMarkdown content={content} />
          </Suspense>
        )
      : content,
  },
  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <RobotFilled size={14} />, style: { background: '#69b1ff' } },
    style: {
      marginInlineEnd: 44,
      marginInlineStart: 10,
    },
    messageRender: content => typeof content === 'string'
      ? (
          <Suspense fallback={<Loading />}>
            <RenderMarkdown content={content} />
          </Suspense>
        )
      : content,
  },
  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    style: {
      marginInlineEnd: 10,
      marginInlineStart: 44,
    },
    // @ts-expect-error 类型错误, 等antdesign-x更新
    messageRender: (message: ChatMessage) => <MessageContent content={message} />,
  },
}
