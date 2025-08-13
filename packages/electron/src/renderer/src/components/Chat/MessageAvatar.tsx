import type { IMessage, IMessageAI } from '@ant-chat/shared'
import { RobotFilled, SmileFilled, UserOutlined } from '@ant-design/icons'
import { Role } from '@/constants'
import { getProviderLogo } from './providerLogo'

interface MessageAvatarProps {
  message: IMessage
}

export function MessageAvatar({ message }: MessageAvatarProps) {
  const { role } = message

  const defaultAvatar = (
    <div className="w-8 h-8 flex items-center justify-center text-white text-lg bg-[#69b1ff] rounded-full">
      <RobotFilled />
    </div>
  )

  if (role === Role.USER) {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-white text-lg bg-[#87d068] rounded-full">
        <UserOutlined />
      </div>
    )
  }

  if (role === Role.SYSTEM) {
    return (
      <div className="w-8 h-8 flex items-center justify-center text-white text-lg bg-[#DE732D] rounded-full">
        <SmileFilled />
      </div>
    )
  }

  if (role === Role.AI) {
    const { modelInfo } = message as IMessageAI
    if (!modelInfo) {
      return defaultAvatar
    }

    const provider = modelInfo?.provider.toLowerCase()
    const ProviderLogo = getProviderLogo(provider || '')

    if (ProviderLogo) {
      return (
        <div className="w-8 h-8 flex items-center justify-center border-solid text-lg border-(--border-color) border-1 bg-white rounded-full">
          <ProviderLogo />
        </div>
      )
    }

    return defaultAvatar
  }

  return defaultAvatar
}
