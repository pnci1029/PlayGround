'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export type Language = 'ko' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// 번역 데이터
const translations = {
  ko: {
    // 네비게이션
    'nav.home': '홈',
    'nav.tools': '도구',
    'nav.canvas': '그림판',
    'nav.chat': '채팅',
    
    // 홈페이지
    'home.title': '내가 필요해서 만든 모든 것',
    'home.subtitle': '개발에 필요한 다양한 도구들을 한 곳에서',
    'home.tools.title': '개발 도구',
    'home.tools.subtitle': '일상 개발에 필요한 유틸리티들',
    'home.canvas.title': '실시간 그림판',
    'home.canvas.subtitle': '협업 가능한 온라인 캔버스',
    'home.chat.title': '익명 채팅',
    'home.chat.subtitle': '실시간 소통 공간',
    
    // 도구 공통
    'tools.json.title': 'JSON 포맷터',
    'tools.json.subtitle': 'JSON 데이터를 예쁘게 정리하고 검증해보세요',
    'tools.variable.title': '변수명 생성기',
    'tools.variable.subtitle': '다양한 네이밍 컨벤션으로 변수명을 변환해보세요',
    
    // JSON 포맷터
    'json.input.placeholder': 'JSON 데이터를 입력하세요...',
    'json.output.placeholder': '포맷된 JSON이 여기에 표시됩니다...',
    'json.format': '포맷',
    'json.minify': '압축',
    'json.validate': '검증',
    'json.clear': '지우기',
    'json.copy': '복사',
    'json.stats.chars': '문자',
    'json.stats.lines': '줄',
    'json.stats.size': '크기',
    'json.error.invalid': '유효하지 않은 JSON입니다',
    
    // 변수명 생성기
    'variable.input.placeholder': '변환할 텍스트를 입력하세요...',
    'variable.camelCase': 'camelCase',
    'variable.PascalCase': 'PascalCase',
    'variable.snake_case': 'snake_case',
    'variable.kebab-case': 'kebab-case',
    'variable.UPPER_SNAKE': 'UPPER_SNAKE_CASE',
    'variable.lowercase': 'lowercase',
    'variable.UPPERCASE': 'UPPERCASE',
    'variable.copy': '복사',
    
    // 캔버스
    'canvas.title': '실시간 그림판',
    'canvas.subtitle': '다른 사용자와 함께 그림을 그려보세요',
    'canvas.tools': '도구',
    'canvas.pen': '펜',
    'canvas.eraser': '지우개',
    'canvas.size': '크기',
    'canvas.color': '색상',
    'canvas.clear': '전체 지우기',
    'canvas.connected': '연결됨',
    'canvas.connecting': '연결 중...',
    'canvas.offline': '오프라인',
    'canvas.usage.title': '사용법',
    'canvas.usage.draw': '마우스를 드래그하여 그림을 그립니다',
    'canvas.usage.tools': '펜/지우개 도구를 선택할 수 있습니다',
    'canvas.usage.brush': '브러시 크기와 색상을 조절할 수 있습니다',
    'canvas.usage.clear': '"전체 지우기" 버튼으로 캔버스를 초기화합니다',
    'canvas.usage.collaboration': '실시간 협업 기능은 곧 추가될 예정입니다',
    
    // 채팅
    'chat.title': '익명 채팅방',
    'chat.subtitle': '자유롭게 대화를 나누어보세요',
    'chat.connected': '연결됨',
    'chat.connecting': '연결 중...',
    'chat.disconnected': '연결 끊김',
    'chat.participants': '참여자',
    'chat.participants.count': '명',
    'chat.participants.loading': '참여자 정보를 불러오는 중...',
    'chat.input.placeholder': '메시지를 입력하세요...',
    'chat.send': '전송',
    'chat.enterToSend': 'Enter로 전송',
    'chat.maxChars': '최대 500자',
    'chat.noMessages': '아직 메시지가 없습니다.',
    'chat.firstMessage': '첫 번째 메시지를 보내보세요! 🎉',
    'chat.rules.title': '채팅 규칙',
    'chat.rules.respect': '서로 존중하며 대화해요',
    'chat.rules.spam': '스팸이나 도배는 금지',
    'chat.rules.privacy': '개인정보 공유 주의',
    'chat.rules.enjoy': '즐겁게 대화해요! 😊',
    'chat.userJoined': '님이 입장했습니다.',
    'chat.userLeft': '님이 퇴장했습니다.'
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.tools': 'Tools',
    'nav.canvas': 'Canvas',
    'nav.chat': 'Chat',
    
    // Homepage
    'home.title': 'Everything I Built Because I Needed It',
    'home.subtitle': 'Development tools gathered in one place',
    'home.tools.title': 'Dev Tools',
    'home.tools.subtitle': 'Daily development utilities',
    'home.canvas.title': 'Real-time Canvas',
    'home.canvas.subtitle': 'Collaborative online drawing',
    'home.chat.title': 'Anonymous Chat',
    'home.chat.subtitle': 'Real-time communication',
    
    // Tool common
    'tools.json.title': 'JSON Formatter',
    'tools.json.subtitle': 'Format and validate JSON data beautifully',
    'tools.variable.title': 'Variable Generator',
    'tools.variable.subtitle': 'Convert text to various naming conventions',
    
    // JSON Formatter
    'json.input.placeholder': 'Enter JSON data...',
    'json.output.placeholder': 'Formatted JSON will appear here...',
    'json.format': 'Format',
    'json.minify': 'Minify',
    'json.validate': 'Validate',
    'json.clear': 'Clear',
    'json.copy': 'Copy',
    'json.stats.chars': 'characters',
    'json.stats.lines': 'lines',
    'json.stats.size': 'size',
    'json.error.invalid': 'Invalid JSON',
    
    // Variable Generator
    'variable.input.placeholder': 'Enter text to convert...',
    'variable.camelCase': 'camelCase',
    'variable.PascalCase': 'PascalCase',
    'variable.snake_case': 'snake_case',
    'variable.kebab-case': 'kebab-case',
    'variable.UPPER_SNAKE': 'UPPER_SNAKE_CASE',
    'variable.lowercase': 'lowercase',
    'variable.UPPERCASE': 'UPPERCASE',
    'variable.copy': 'Copy',
    
    // Canvas
    'canvas.title': 'Real-time Canvas',
    'canvas.subtitle': 'Draw together with other users',
    'canvas.tools': 'Tools',
    'canvas.pen': 'Pen',
    'canvas.eraser': 'Eraser',
    'canvas.size': 'Size',
    'canvas.color': 'Color',
    'canvas.clear': 'Clear All',
    'canvas.connected': 'Connected',
    'canvas.connecting': 'Connecting...',
    'canvas.offline': 'Offline',
    'canvas.usage.title': 'How to Use',
    'canvas.usage.draw': 'Drag mouse to draw',
    'canvas.usage.tools': 'Select pen/eraser tools',
    'canvas.usage.brush': 'Adjust brush size and color',
    'canvas.usage.clear': 'Use "Clear All" to reset canvas',
    'canvas.usage.collaboration': 'Real-time collaboration coming soon',
    
    // Chat
    'chat.title': 'Anonymous Chat',
    'chat.subtitle': 'Chat freely with others',
    'chat.connected': 'Connected',
    'chat.connecting': 'Connecting...',
    'chat.disconnected': 'Disconnected',
    'chat.participants': 'Participants',
    'chat.participants.count': '',
    'chat.participants.loading': 'Loading participants...',
    'chat.input.placeholder': 'Type a message...',
    'chat.send': 'Send',
    'chat.enterToSend': 'Press Enter to send',
    'chat.maxChars': 'max 500 chars',
    'chat.noMessages': 'No messages yet.',
    'chat.firstMessage': 'Send the first message! 🎉',
    'chat.rules.title': 'Chat Rules',
    'chat.rules.respect': 'Respect each other',
    'chat.rules.spam': 'No spam or flooding',
    'chat.rules.privacy': 'Be careful with personal info',
    'chat.rules.enjoy': 'Have fun chatting! 😊',
    'chat.userJoined': ' joined the chat.',
    'chat.userLeft': ' left the chat.'
  }
}

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('ko')
  
  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['ko']] || key
  }
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}