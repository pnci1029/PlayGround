'use client'

import { useState, useCallback } from 'react'

interface TranslationCache {
  [key: string]: string
}

export function useTranslation() {
  const [cache, setCache] = useState<TranslationCache>({})

  // 기술 용어 사전
  const techTerms: { [key: string]: string } = {
    'AI': 'AI',
    'ML': '머신러닝',
    'API': 'API',
    'LLM': '대형 언어모델',
    'ChatGPT': 'ChatGPT',
    'OpenAI': 'OpenAI',
    'GitHub': 'GitHub',
    'React': 'React',
    'JavaScript': 'JavaScript',
    'TypeScript': 'TypeScript',
    'Node.js': 'Node.js',
    'Python': 'Python',
    'Docker': 'Docker',
    'Kubernetes': '쿠버네티스',
    'DevOps': 'DevOps',
    'Frontend': '프론트엔드',
    'Backend': '백엔드',
    'Database': '데이터베이스',
    'PostgreSQL': 'PostgreSQL',
    'MongoDB': 'MongoDB',
    'Redis': 'Redis',
    'AWS': 'AWS',
    'Azure': 'Azure',
    'GCP': 'GCP'
  }

  // 전처리: 번역하기 전 텍스트 정제 및 컨텍스트 분석
  const preprocessText = (text: string): string => {
    // 기술 용어 보호 (번역되지 않도록)
    let processed = text
    Object.keys(techTerms).forEach(term => {
      const regex = new RegExp(`\\b${term}\\b`, 'gi')
      processed = processed.replace(regex, `__TECH_${term.toUpperCase()}__`)
    })

    return processed
      .replace(/\s*-\s*/g, ' | ')  // " - " → " | "
      .replace(/:\s*/g, ': ')     // 콜론 뒤 공백 정리
      .replace(/\s+/g, ' ')      // 연속 공백 제거
      .trim()
  }

  // 후처리: 번역 후 한국어 자연스럽게 다듬기
  const postprocessText = (translated: string): string => {
    let result = translated
    
    // 기술 용어 복원
    Object.entries(techTerms).forEach(([original, korean]) => {
      const placeholder = `__TECH_${original.toUpperCase()}__`
      result = result.replace(new RegExp(placeholder, 'g'), korean)
    })

    return result
      .replace(/\s*\|\s*/g, ' · ')        // " | " → " · "
      .replace(/\s*:\s*/g, ': ')          // 콜론 정리
      .replace(/\s*-\s*/g, ' - ')         // 하이픈 정리
      .replace(/([가-힣])\s+([가-힣])/g, '$1 $2')  // 한글 단어간 적절한 간격
      .replace(/\s+/g, ' ')               // 연속 공백 제거
      .replace(/^[가-힣]+\s*:\s*/g, '')   // 불필요한 카테고리 접두사 제거
      .replace(/\s*\.\.\.\s*$/, '')       // 끝의 "..." 제거
      .trim()
  }

  // 컨텍스트 감지
  const detectContext = (text: string): string => {
    if (/\b(github|repository|repo|git)\b/i.test(text)) return '개발'
    if (/\b(news|breaking|report)\b/i.test(text)) return '뉴스'
    if (/\b(AI|ML|ChatGPT|OpenAI|LLM)\b/i.test(text)) return 'AI'
    if (/\b(crypto|bitcoin|blockchain)\b/i.test(text)) return '암호화폐'
    if (/\b(startup|funding|IPO)\b/i.test(text)) return '스타트업'
    return '일반'
  }

  const translateText = useCallback(async (text: string): Promise<string> => {
    if (!text || text.trim() === '') return text
    
    // 이미 한국어인 경우 그대로 반환
    if (/[가-힣]/.test(text)) return text
    
    // 캐시 확인
    if (cache[text]) return cache[text]

    try {
      // 컨텍스트 감지
      const context = detectContext(text)
      
      // 전처리
      const preprocessed = preprocessText(text)
      
      // 컨텍스트별 번역 힌트 추가
      const contextHint = context !== '일반' ? `[${context} 관련] ` : ''
      const textToTranslate = `${contextHint}${preprocessed}`
      
      // Google Translate 무료 API 사용
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(textToTranslate)}`)
      const result = await response.json()
      
      if (result && result[0] && result[0][0]) {
        let translated = result[0][0][0]
        
        // 컨텍스트 힌트 제거
        translated = translated.replace(/^\[.*?\]\s*/, '')
        
        // 후처리
        translated = postprocessText(translated)
        
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