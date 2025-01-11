interface IconProps {
  name: string
  classNames?: string
  style?: React.CSSProperties
}

export default function Icon({ name, classNames, style }: IconProps) {
  return <div className={`w-1em h-1em ${name} ${classNames}`} style={style} />
}
