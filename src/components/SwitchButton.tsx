import { useToken } from '@/utils'

interface SwitchButtonProps {
  checked: boolean
  onChange: (checked: boolean) => void
  icon: React.ReactNode
}

function SwitchButton({ checked, onChange, icon }: SwitchButtonProps) {
  const { token } = useToken()

  return (
    <div
      role="switchButton"
      className="ant-btn antd-css-var w-8 h-8 flex justify-center items-center border-1 border-solid cursor-pointer"
      style={{
        borderRadius: token.borderRadius,
        color: checked ? token.colorPrimary : 'var(--ant-button-default-color)',
        borderColor: checked ? token.colorPrimary : 'var(--ant-button-default-border-color)',
      }}
      onClick={() => onChange(!checked)}
    >
      {icon}
    </div>
  )
}

export default SwitchButton
