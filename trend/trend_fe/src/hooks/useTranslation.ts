'use client'

import { useState, useCallback } from 'react'

interface TranslationCache {
  [key: string]: string
}

export function useTranslation() {
  const [cache, setCache] = useState<TranslationCache>({})

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || text.trim() === '') return text
    
    // 이미 한국어인 경우 그대로 반환
    if (/[가-힣]/.test(text)) return text
    
    // 캐시 확인
    if (cache[text]) return cache[text]

    try {
      // Google Translate 무료 API 사용
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(text)}`)
      const result = await response.json()
      
      if (result && result[0] && result[0][0]) {
        const translated = result[0][0][0]
        
        // 캐시에 저장
        setCache(prev => ({ ...prev, [text]: translated }))
        return translated
      }
    } catch (error) {
      console.warn('번역 실패:', error)
    }

    return text
  }, [cache])

  return { translateText }
}