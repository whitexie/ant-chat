export function Logo() {
  return (
    <div className="flex justify-center items-center gap-2 relative logo select-none">
      <div className="w-7 h-7">
        <img src="/logo.svg" alt="logo" className="w-full h-full" draggable={false} />
      </div>
      <div className="text-lg/8">
        Ant Chat
      </div>
    </div>
  )
}
