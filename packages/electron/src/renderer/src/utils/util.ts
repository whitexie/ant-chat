import { clipboard } from 'electron'
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

export function uuid(prefix?: string) {
  return `${prefix || ''}${nanoid()}`
}

export async function clipboardWrite(text: string) {
  const _text = `<div>${text}</div>`

  console.log('clipboardWrite', _text)

  return clipboard.write({
    html: _text,
  })
}
