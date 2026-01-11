export const toolsService = {
  // JSON Formatter 로직
  async formatJson(jsonString: string) {
    try {
      const parsed = JSON.parse(jsonString)
      return {
        formatted: JSON.stringify(parsed, null, 2),
        minified: JSON.stringify(parsed),
        size: {
          original: jsonString.length,
          formatted: JSON.stringify(parsed, null, 2).length,
          minified: JSON.stringify(parsed).length
        }
      }
    } catch (error) {
      throw new Error('Invalid JSON format')
    }
  },

  // Variable Generator 로직
  async generateVariable(text: string, style: string) {
    const cleanText = text.trim().toLowerCase()
    
    const generators = {
      camelCase: () => cleanText.replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()),
      PascalCase: () => cleanText.replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase()).replace(/^(.)/, (_, char) => char.toUpperCase()),
      snake_case: () => cleanText.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, ''),
      'kebab-case': () => cleanText.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, ''),
      UPPER_SNAKE_CASE: () => cleanText.replace(/[^a-zA-Z0-9]+/g, '_').replace(/^_|_$/g, '').toUpperCase()
    }

    const generator = generators[style as keyof typeof generators]
    if (!generator) {
      throw new Error('Unsupported style')
    }

    return {
      original: text,
      result: generator(),
      style
    }
  },

  // 사용 가능한 도구 목록
  async getToolsList() {
    return [
      {
        id: 'json-formatter',
        name: 'JSON Formatter',
        description: 'Format, validate, and minify JSON',
        path: '/tools/json-formatter'
      },
      {
        id: 'variable-generator',
        name: 'Variable Generator',
        description: 'Generate variables in different naming conventions',
        path: '/tools/variable-generator'
      }
    ]
  }
}