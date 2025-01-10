namespace API {

  interface ChatModel {
    id: string
    object: 'model'
    owned_by: string
  }

  interface MessageItem {
    role: string
    content: string
  }
}
