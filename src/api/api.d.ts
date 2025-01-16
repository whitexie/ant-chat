namespace API {

  interface ChatModel {
    id: string
    object: 'model'
    owned_by: string
  }

  interface TextContent {
    type: 'text'
    text: string
  }

  interface ImageContent {
    type: 'image_url'
    image_url: IImage
  }

  interface IImage {
    uid: string
    name: string
    size: number
    type: string
    url: string
  }

  type MessageContent = string | (TextContent | ImageContent)[]

  interface MessageItem {
    role: string
    content: MessageContent
  }
}
