import { useEffect, useImperativeHandle, useRef } from 'react'

interface Props {
  // 是否还有更多数据
  hasMore: boolean
  // 加载状态
  loading: boolean
  // 加载更多的回调函数
  onLoadMore: () => Promise<void>
  // 加载提示组件
  loadingComponent?: React.ReactNode
  // 无更多数据提示组件
  noMoreComponent?: React.ReactNode
  // 容器类名
  className?: string
  // 子元素
  children: React.ReactNode
  // 观察器的阈值
  threshold?: number
  // 新增加载方向配置
  direction?: 'top' | 'bottom' | 'both'
  ref?: React.Ref<{ scrollToBottom: () => void }>
}

export const InfiniteScroll: React.FC<Props> = ({
  hasMore,
  loading,
  onLoadMore,
  loadingComponent,
  noMoreComponent,
  className = '',
  children,
  threshold = 0.1,
  ref,
  direction = 'top', // 默认触顶加载
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const topObserverRef = useRef<HTMLDivElement>(null)
  const bottomObserverRef = useRef<HTMLDivElement>(null)
  const oldScrollHeightRef = useRef<number>(0)

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    const shouldObserveTop = direction === 'top' || direction === 'both'
    const shouldObserveBottom = direction === 'bottom' || direction === 'both'

    const observer = new IntersectionObserver(
      async (entries) => {
        const entry = entries[0]
        if (!entry.isIntersecting || loading || !hasMore)
          return

        if (containerRef.current) {
          oldScrollHeightRef.current = containerRef.current.scrollHeight
        }

        await onLoadMore()

        // 只在触顶加载时需要保持滚动位置
        if (entry.target === topObserverRef.current) {
          requestAnimationFrame(() => {
            if (containerRef.current) {
              const newScrollHeight = containerRef.current.scrollHeight
              const scrollDiff = newScrollHeight - oldScrollHeightRef.current
              containerRef.current.scrollTop = scrollDiff
            }
          })
        }
      },
      {
        root: containerRef.current,
        threshold,
      },
    )

    // 根据方向设置观察器
    if (shouldObserveTop && topObserverRef.current) {
      observer.observe(topObserverRef.current)
    }
    if (shouldObserveBottom && bottomObserverRef.current) {
      observer.observe(bottomObserverRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, loading, onLoadMore, threshold, direction])

  useImperativeHandle(ref, () => ({
    scrollToBottom,
  }))

  return (
    <div
      ref={containerRef}
      className={`overflow-y-auto ${className}`}
    >
      {/* 触顶加载观察器 */}
      {(direction === 'top' || direction === 'both') && (
        <div ref={topObserverRef} className="h-4">
          {!hasMore && noMoreComponent}
        </div>
      )}

      {loading && loadingComponent}

      {children}

      {/* 触底加载观察器 */}
      {(direction === 'bottom' || direction === 'both') && (
        <div ref={bottomObserverRef} className="h-4">
          {!hasMore && noMoreComponent}
        </div>
      )}
    </div>
  )
}
