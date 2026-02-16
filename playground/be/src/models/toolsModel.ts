// Tools 관련 타입 정의

export interface JsonFormatRequest {
  json: string
}

export interface JsonFormatResponse {
  formatted: string
  minified: string
  size: {
    original: number
    formatted: number
    minified: number
  }
}

export interface VariableGeneratorRequest {
  text: string
  style: 'camelCase' | 'PascalCase' | 'snake_case' | 'kebab-case' | 'UPPER_SNAKE_CASE'
}

export interface VariableGeneratorResponse {
  original: string
  result: string
  style: string
}

export interface Tool {
  id: string
  name: string
  description: string
  path: string
}

export interface ToolsListResponse {
  tools: Tool[]
}