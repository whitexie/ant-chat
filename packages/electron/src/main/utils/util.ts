import { clipboard } from 'electron'

export function clipboardWrite(data: Electron.Data, type?: 'selection' | 'clipboard') {
  clipboard.write(data, type)
  return true
}
