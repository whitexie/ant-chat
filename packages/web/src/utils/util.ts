import { nanoid } from 'nanoid'

export function debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>

  return function (...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      func(...args)
    }, delay)
  }
}

export function uuid() {
  return nanoid()
}

export async function clipboardWriteText(text: string) {
  // 检查浏览器是否支持剪切板 API
  if (!navigator.clipboard) {
    return { ok: false, message: '当前浏览器不支持剪切板 API' }
  }
  return navigator.clipboard.writeText(text)
    .then(() => {
      return { ok: true, message: '复制成功' }
    })
    .catch(() => {
      return { ok: false, message: '复制失败' }
    })
}
