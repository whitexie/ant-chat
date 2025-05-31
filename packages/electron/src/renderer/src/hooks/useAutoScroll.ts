import type { ImperativeHandleRef } from '../components/InfiniteScroll'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useAutoScroll() {
  const [autoScrollToBottom, setAutoScrollToBottom] = useState(true)
  const infiniteScrollRef = useRef<ImperativeHandleRef>(null)

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement
    setAutoScrollToBottom(
      target.scrollHeight - Math.abs(target.scrollTop) - target.clientHeight <= 1,
    )
  }, [])

  const scrollToBottom = useCallback(() => {
    infiniteScrollRef.current?.scrollToBottom()
  }, [])

  // 自动滚动到最底部
  useEffect(() => {
    if (autoScrollToBottom) {
      scrollToBottom()
    }
  })

  return {
    autoScrollToBottom,
    infiniteScrollRef,
    handleScroll,
    scrollToBottom,
  }
}
