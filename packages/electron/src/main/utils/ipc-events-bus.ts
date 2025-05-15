import type { IpcEvents } from '../../types/db-ipc-even'
import { IpcEmitter, IpcListener } from '@electron-toolkit/typed-ipc/main'

// 创建事件监听器和处理器实例
export const mainListener = new IpcListener<IpcEvents>()
export const mainEmitter = new IpcEmitter()

export function createIpcResponse<T>(success: boolean, data: T, msg?: string): IpcResponse<T> {
  return {
    success,
    msg: msg ?? '',
    data,
  }
}

export function createIpcPaginatedResponse<T>(success: boolean, data: T, msg?: string, total?: number): IpcPaginatedResponse<T> {
  return {
    success,
    msg: msg ?? '',
    data,
    total: total ?? 0,
  }
}

export interface IpcResponse<T> {
  success: boolean
  msg: string
  data: T | null
}

export interface IpcPaginatedResponse<T> extends IpcResponse<T> {
  total: number
}
