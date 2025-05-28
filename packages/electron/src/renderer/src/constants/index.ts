import type { IConversations, IMessage } from '@ant-chat/shared'

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
  conversations: [] as IConversations[],
  messages: [] as IMessage[],
  exportTime: -1,
}

export type AntChatFileStructure = typeof ANT_CHAT_STRUCTURE

export const ANT_CHAT_FILE_TYPE = { description: 'ant chat files', appcept: { 'text/plain': ['.antchat'] } }

export const TITLE_PROMPT = `Based on the chat history, give this conversation a name.
Keep it short.
Use 简体中文.
Just provide the name, nothing else.

Here's the conversation:
--------------------------------
pGqat5J/L@~U
--------------------------------
Name this conversation in 10 characters or less.
Use 简体中文.
Only give the name, nothing else.
The name is:
`

export const AI_OFFICIAL_API_INFO: { [provider: string]: { url: string, keyUrl: string } } = {
  openai: {
    url: 'https://api.openai.com',
    keyUrl: 'https://platform.openai.com/api-keys',
  },
  deepseek: {
    url: 'https://api.deepseek.com',
    keyUrl: 'https://platform.deepseek.com/api_keys',
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta',
    keyUrl: 'https://aistudio.google.com/apikey',
  },
} as const
