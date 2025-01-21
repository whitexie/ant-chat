export function Logo() {
  return (
    <div className="logo flex justify-center items-center gap-2 w-[var(--conversationWidth)]">
      <div className="w-7 h-7">
        <img src="/logo.svg" alt="logo" className="w-full h-full" />
      </div>
      <div
        className="text-5 line-height-32px"
        style={{
          // color: token.colorText,
        }}
      >
        Ant Chat
      </div>
    </div>
  )
}
