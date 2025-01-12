import type { Bubble } from '@ant-design/x'
import type { GetProp } from 'antd'
import Icon from '@/components/Icon'
import { Role } from '@/constants'

const COMMON_STYLE = { backgroundColor: 'white' }

export const roles: GetProp<typeof Bubble.List, 'roles'> = {
  [Role.AI]: {
    placement: 'start',
    avatar: { icon: <Icon name="i-ant-design:user-outlined" style={COMMON_STYLE} />, style: { background: '#69b1ff' } },
  },
  [Role.USER]: {
    placement: 'end',
    avatar: { icon: <Icon name="i-ant-design:user-outlined" style={COMMON_STYLE} />, style: { background: '#87d068' } },
  },
}
