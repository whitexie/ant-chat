import type { IpcEvents, IpcRendererEvent } from '@ant-chat/shared'
import { IpcEmitter, IpcListener } from '@electron-toolkit/typed-ipc/renderer'

export const ipc = new IpcListener<IpcRendererEvent>()
export const emitter = new IpcEmitter<IpcEvents>()
