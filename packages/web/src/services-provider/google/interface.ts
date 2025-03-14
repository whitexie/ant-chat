export interface TextPart {
  text: string
}

export interface IFilePart {
  inline_data: {
    mimeType: string
    data: string
  }
}

export type Part = TextPart | IFilePart

export interface UserContent {
  role: 'user'
  parts: Part[]
}

export interface ModelContent {
  role: 'model'
  parts: TextPart[]
}

export interface GeminiRequestBody {
  contents: (UserContent | ModelContent)[]
  system_instruction?: {
    parts: TextPart[]
  }
  generationConfig?: {
    temperature?: number
  }
  tools?: [
    { googleSearch: object },
  ]

}

export interface GeminiModel {
  name: string
  version: string
  displayName: string
  description: string
  inputTokenLimit: number
  outputTokenLimit: number
  temperature: number
  topP: number
  topK: number
}

export interface GetModelsResponse {
  models: GeminiModel[]
}
