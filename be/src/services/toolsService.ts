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
  async generateVariable(text: string) {
    const cleanText = text.trim().toLowerCase()
    
    // Remove special characters and split into words
    const words = cleanText.split(/[^a-zA-Z0-9]+/).filter(word => word.length > 0)
    
    return {
      original: text,
      variables: {
        camelCase: words.map((word, index) => 
          index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)
        ).join(''),
        PascalCase: words.map(word => 
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join(''),
        snake_case: words.join('_'),
        'kebab-case': words.join('-'),
        UPPER_SNAKE_CASE: words.join('_').toUpperCase(),
        lowercase: words.join('').toLowerCase(),
        UPPERCASE: words.join('').toUpperCase()
      }
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