import type { IpcEvents, IpcRendererEvent } from '@ant-chat/shared'
import { IpcEmitter, IpcListener } from '@electron-toolkit/typed-ipc/main'

// 创建事件监听器和处理器实例
export const mainListener = new IpcListener<IpcEvents>()
export const mainEmitter = new IpcEmitter<IpcRendererEvent>()
