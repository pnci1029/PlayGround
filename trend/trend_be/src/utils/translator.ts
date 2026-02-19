export class TranslatorService {
  private cache = new Map<string, string>()
  
  // 무료 번역 API 사용
  async translateToKorean(text: string): Promise<string> {
    if (!text || text.trim() === '') return text
    
    // 이미 한국어인 경우 그대로 반환
    if (/[가-힣]/.test(text)) return text
    
    // 캐시 확인
    const cacheKey = text.toLowerCase()
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }

    try {
      // Libre Translate (무료 오픈소스 번역 API)
      const response = await fetch('https://libretranslate.com/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: text,
          source: 'en',
          target: 'ko',
          format: 'text'
        })
      })

      if (response.ok) {
        const result = await response.json() as { translatedText: string }
        const translated = result.translatedText || text
        
        // 캐시에 저장
        this.cache.set(cacheKey, translated)
        return translated
      }
    } catch (error) {
      console.warn('번역 실패:', error)
    }

    // 번역 실패시 원본 텍스트 반환
    return text
  }

  // 배치 번역
  async translateBatch(texts: string[]): Promise<string[]> {
    const translations = await Promise.allSettled(
      texts.map(text => this.translateToKorean(text))
    )
    
    return translations.map((result, index) => 
      result.status === 'fulfilled' ? result.value : texts[index]
    )
  }

  // 캐시 정리
  clearCache() {
    this.cache.clear()
  }

  // 캐시 상태
  getCacheSize() {
    return this.cache.size
  }
}

export const translator = new TranslatorService()