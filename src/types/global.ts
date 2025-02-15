import type { IAttachment } from '@/db/interface'

export type RequireKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

export interface BubbleContent {
  content: string
  images: IAttachment[]
  attachments: IAttachment[]
}
