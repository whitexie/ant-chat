import { nanoid } from 'nanoid'
import { emitter } from './ipc-bus'

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

export async function clipboardWrite(data: Electron.Data) {
  return await emitter.invoke('common:clipboard-write', data)
}
