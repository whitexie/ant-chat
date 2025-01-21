import type { Bubble } from '@ant-design/x'
import type { GetProp } from 'antd'
import { Role } from '@/constants'
import { UserOutlined } from '@ant-design/icons'

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#69b1ff' } },
    style: {
      marginInlineEnd: 44,
      marginInlineStart: 10,
    },
  },
  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
    style: {
      marginInlineEnd: 10,
      marginInlineStart: 44,
    },
  },
}
