import { Popover } from 'antd'
import React from 'react'
import { useToken } from '@/utils'

interface SwitchButtonProps {
  checked: boolean
  icon: React.ReactNode
  dataTestId?: string
  onChange?: (checked: boolean) => void
  popoverContent?: React.ReactNode
  popoverTrigger?: 'hover' | 'click' | 'focus'
}

function SwitchButton({
  checked,
  icon,
  dataTestId,
  onChange,
  popoverContent,
  popoverTrigger = 'click',
}: SwitchButtonProps) {
  const { token } = useToken()

  const buttonElement = (
    <div
      role="switchButton"
      data-testid={dataTestId}
      className="w-8 h-8 flex justify-center items-center border-1 border-solid cursor-pointer ant-btn antd-css-var"
      style={{
        borderRadius: token.borderRadius,
        color: checked ? token.colorPrimary : 'var(--ant-button-default-color)',
        borderColor: checked ? token.colorPrimary : 'var(--ant-button-default-border-color)',
      }}
      onClick={() => onChange?.(!checked)}
    >
      {icon}
    </div>
  )

  if (popoverContent) {
    return (
      <Popover
        trigger={popoverTrigger}
        content={popoverContent}
        getPopupContainer={() => document.body}
      >
        {buttonElement}
      </Popover>
    )
  }

  return buttonElement
}

export default SwitchButton
