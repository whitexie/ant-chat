export enum Role {
  SYSTEM = 'system',
  USER = 'user',
  AI = 'assistant',
}

export const DEFAULT_TITLE = 'Untitled'
export const DEFAULT_SYSTEM_MESSAGE = 'You are a helpful assistant.'

export const ANT_CHAT_STRUCTURE = {
  type: 'Ant Chat',
  version: '1',
  modelConfig: {},
  conversations: [],
  exportTime: -1,
}

export const ANT_CHAT_FILE_TYPE = { description: 'ant chat files', appcept: { 'text/plain': ['.antchat'] } }
