import { useEffect, useRef, useState } from 'react'

export function useConversationsListHeight() {
  const [listHeight, setListHeight] = useState<React.CSSProperties>({ height: '0px' })
  const headerDivRef = useRef<HTMLDivElement>(null)
  const footerDivRef = useRef<HTMLDivElement>(null)

  function handleResize() {
    const headerHeight = headerDivRef.current?.getBoundingClientRect().height || 0
    const footerHeight = footerDivRef.current?.getBoundingClientRect().height || 0

    setListHeight({ height: `calc(100vh - ${headerHeight + footerHeight}px - var(--headerHeight))` })
  }

  useEffect(() => {
    window.addEventListener('resize', handleResize)
    handleResize()
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return { headerDivRef, footerDivRef, listHeight }
}
