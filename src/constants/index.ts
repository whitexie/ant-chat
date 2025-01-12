export enum Role {
  SYSTEM = 'system',
  USER = 'user',
  AI = 'assistant',
}

export const DEFAULT_TITLE = '新对话'

export const ANT_CHAT_STRUCTURE = {
  type: 'Ant Chat',
  version: '1',
  modelConfig: {},
  conversations: [],
}
