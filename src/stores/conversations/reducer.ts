import type { ChatMessage } from '@/hooks/useChat'
import { getNow, uuid } from '@/utils'

interface AddConversation {
  type: 'add'
  item: IConversation
}

interface RenameConversation {
  type: 'rename'
  option: Pick<IConversation, 'id' | 'title'>
}

interface DeleteConversion {
  type: 'delete'
  id: string
}

interface ImportConversions {
  type: 'improt'
  items: IConversation[]
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

export type ConversationsReducerAction = AddConversation | RenameConversation | DeleteConversion | ImportConversions | ConversationMessageActions

export function conversationsReducer(draft: IConversation[], action: ConversationsReducerAction) {
  switch (action.type) {
    case 'add': {
      draft.push(action.item)
      break
    }

    case 'rename': {
      renameConversation(draft, action.option)
      break
    }

    case 'delete': {
      deleteConversation(draft, action.id)
      break
    }

    case 'improt': {
      importConversations(draft, action.items)
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

function renameConversation(draft: IConversation[], option: RenameConversation['option']) {
  const { id, title } = option
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
