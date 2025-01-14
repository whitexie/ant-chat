import type { ChatMessage } from '@/hooks/useChat'
import { getNow, uuid } from '@/utils'

interface AddConversation {
  type: 'add'
  item: IConversation
}

interface RenameConversation {
  type: 'rename'
  id: string
  title: string
}

interface DeleteConversion {
  type: 'delete'
  id: string
}

interface ImportConversions {
  type: 'import'
  items: IConversation[]
}

interface ClearConversations {
  type: 'clear'
}

interface UpdateConversionMessages {
  type: 'updateMessage'
  id: string
  messages: ChatMessage[]
}

interface AddConversionMessageAction {
  type: 'addMessage'
  id: string
  item: ChatMessage
}

type ConversationMessageActions = AddConversionMessageAction | UpdateConversionMessages

export type ConversationsReducerAction = ClearConversations | AddConversation | RenameConversation | DeleteConversion | ImportConversions | ConversationMessageActions

export function conversationsReducer(draft: IConversation[], action: ConversationsReducerAction) {
  switch (action.type) {
    case 'add': {
      draft.splice(0, 0, action.item)
      break
    }

    case 'rename': {
      const { id, title } = action
      renameConversation(draft, id, title)
      break
    }

    case 'delete': {
      deleteConversation(draft, action.id)
      break
    }

    case 'import': {
      importConversations(draft, action.items)
      break
    }

    case 'clear': {
      draft.splice(0, draft.length)
      break
    }

    case 'updateMessage': {
      const { id, messages } = action
      updateMessage(draft, id, messages)
      break
    }

    case 'addMessage': {
      const { id, item } = action
      addMessage(draft, id, item)
      break
    }

    default:
      throw new Error(`not found action type`)
  }
}

export function createConversation(option?: Partial<IConversation>) {
  return Object.assign({
    id: uuid(),
    title: '',
    messages: [],
    createAt: getNow(),
  }, option)
}

function deleteConversation(draft: IConversation[], id: string) {
  const index = draft.findIndex(item => item.id === id)
  if (index > -1) {
    draft.splice(index, 1)
  }
}

function renameConversation(draft: IConversation[], id: string, title: string) {
  const index = draft.findIndex(item => item.id === id)
  draft[index].title = title
}

function importConversations(draft: IConversation[], list: IConversation[]) {
  const conversationsSet = new Set(draft.map(item => item.id))
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (conversationsSet.has(item.id)) {
      draft[i] = item
    }
    else {
      draft.push(item)
    }
  }

  // 按创建时间倒序排列
  draft.sort((a, b) => b.createAt - a.createAt)
}

function updateMessage(draft: IConversation[], id: string, messages: ChatMessage[]) {
  const index = draft.findIndex(item => item.id === id)
  if (index > -1) {
    draft[index].messages = [...messages]
  }
}

function addMessage(draft: IConversation[], id: string, item: ChatMessage) {
  const index = draft.findIndex(item => item.id === id)
  if (index > -1) {
    draft[index].messages.push(item)
  }
}
