export interface TextPart {
  text: string
}

export interface IFilePart {
  inline_data: {
    mimeType: string
    data: string
  }
}

export interface RequestFunctionCallPart {
  functionCall: FunctionCallPart['functionCall']
}

export interface FunctionCallResponsePart {
  functionResponse: {
    name: string
    response: {
      result: any
    }
  }
}

export type Part = TextPart | IFilePart | FunctionCallResponsePart

export type ModelPart = TextPart | RequestFunctionCallPart

export interface UserContent {
  role: 'user'
  parts: Part[]
}

export interface ModelContent {
  role: 'model'
  parts: ModelPart[]
}

export interface GeminiFunctionCall {
  name: string
  description?: string
  parameters: object
}

export interface FunctionDeclaration {
  functionDeclarations: GeminiFunctionCall[]
}

export interface GoogleSearchTool {
  googleSearch: object
}

export interface GeminiRequestBody {
  contents: (UserContent | ModelContent)[]
  system_instruction?: {
    parts: TextPart[]
  }
  generationConfig?: {
    temperature?: number
  }
  tools?: (GoogleSearchTool | FunctionDeclaration)[]
  toolConfig?: {
    functionCallingConfig: {
      mode: 'auto' | 'any' | 'none'
    }
  }
}

export interface GeminiResponse {
  candidates: [
    {
      content: {
        parts: (TextPart | FunctionCallPart)[]
      }
    },
  ]
}

export interface TextPart {
  text: string
}
export interface FunctionCallPart {
  functionCall: {
    name: string
    args: Record<string, unknown> | string
  }
}
