interface SideButtonProps {
  icon: React.ReactNode
  children?: React.ReactNode
  onClick?: () => void
}

function SideButton({ icon, children, onClick }: SideButtonProps) {
  return (
    <div className="flex w-full items-center gap-4 cursor-pointer p-2 rounded-md hover:bg-gray-300" onClick={onClick}>
      <div className="flex-shrink-0 flex justify-center items-center">
        {icon}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  )
}

export default SideButton
