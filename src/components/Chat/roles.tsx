import type { BubbleContent } from '@/types/global'
import type { BubbleListProps } from '@ant-design/x/es/bubble/BubbleList'
import { Role } from '@/constants'
import { RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { type GetProp, Typography } from 'antd'
import MessageContent from './MessageContent'

export const roles: GetProp<BubbleListProps, 'roles'> = {
  [Role.SYSTEM]: {
    placement: 'start',
    avatar: { icon: <SmileFilled size={14} />, style: { background: '#DE732D' } },
    style: {
      marginInlineEnd: 44,
      marginInlineStart: 10,
    },
    // @ts-expect-error 忽略错误
    messageRender: (content: BubbleContent) => <MessageContent {...content} />,
  },

  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <RobotFilled size={14} />, style: { background: '#69b1ff' } },
    style: {
      marginInlineEnd: 44,
      marginInlineStart: 10,
    },
    // @ts-expect-error 忽略错误
    messageRender: (content: BubbleContent) => {
      console.log('content => ', content)
      return content.status === 'error'
        ? (
            <>
              <Typography.Paragraph>
                <Typography.Text type="danger">请求失败，请检查配置是否正确</Typography.Text>
              </Typography.Paragraph>
              <Typography.Paragraph>
                <Typography.Text type="danger">{content.content}</Typography.Text>
              </Typography.Paragraph>
            </>
          )
        : <MessageContent {...content} />
    },
  },

  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    style: {
      marginInlineEnd: 10,
      marginInlineStart: 44,
    },
    // @ts-expect-error 忽略错误
    messageRender: (content: BubbleContent) => <MessageContent {...content} />,
  },
}
