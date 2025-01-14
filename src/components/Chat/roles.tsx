import type { Bubble } from '@ant-design/x'
import type { GetProp } from 'antd'
import { Role } from '@/constants'
import { UserOutlined } from '@ant-design/icons'

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <UserOutlined />, style: { background: '#69b1ff' } },
  },
  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <UserOutlined />, style: { background: '#87d068' } },
  },
}
