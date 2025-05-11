import { useToken } from '@/utils'

interface IconProps {
  name: string
  classNames?: string
  style?: React.CSSProperties
  onClick?: () => void
}

export default function Icon({ name, classNames, style, onClick }: IconProps) {
  const { token } = useToken()

  const _style = {
    cursor: onClick ? 'pointer' : '',
    backgroundColor: token.colorText,
    ...style,
  }

  return <div className={`w-1em h-1em bg-[var(--ant-color-text)] ${name} ${classNames}`} style={_style} onClick={onClick} />
}
