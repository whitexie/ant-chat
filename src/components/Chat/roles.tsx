import type { Bubble } from '@ant-design/x'
import type { GetProp } from 'antd'
import Icon from '@/components/Icon'
import { Role } from '@/constants'

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <Icon name="i-ant-design:user-outlined" />, style: { background: '#fde3cf' } },
  },
  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <Icon name="i-ant-design:user-outlined" />, style: { background: '#87d068' } },
  },
}
