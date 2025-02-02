import type { Role } from '@/constants'

export interface TextContent {
  type: 'text'
  text: string
}

export interface ImageContent {
  type: 'image_url'
  image_url: {
    url: string
  }
}

export type MessageContent = string | (TextContent | ImageContent)[]

export interface MessageItem {
  role: Role
  content: MessageContent
}
