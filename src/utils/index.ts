import { nanoid } from 'nanoid'

export * from './file'
export * from './time'

export function uuid() {
  return nanoid()
}
