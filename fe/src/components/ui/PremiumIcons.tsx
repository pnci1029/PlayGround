// 프리미엄 품질의 FreeTools.org 수준 아이콘 시스템
import React from 'react'

interface IconProps {
  className?: string
  size?: number
}

// JSON 포맷터 - 데이터 구조와 포맷팅을 표현
export const JsonFormatterIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="10" width="32" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M16 18v12M20 18h8M24 24h-8M20 30h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="36" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="36" cy="24" r="1.5" fill="currentColor"/>
    <circle cx="36" cy="28" r="1.5" fill="currentColor"/>
    <path d="M14 16L12 18L14 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M18 16L20 18L18 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// 변수 생성기 - 텍스트 변환과 명명 규칙을 표현
export const VariableGeneratorIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="6" y="12" width="36" height="24" rx="3" stroke="currentColor" strokeWidth="2"/>
    <path d="M12 20h6m-6 8h6M24 20h12m-12 4h8m-8 4h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18 16v16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="39" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M36 9h6M39 6v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// URL 인코더 - 링크와 변환을 표현
export const UrlEncoderIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="16" cy="16" r="8" stroke="currentColor" strokeWidth="2"/>
    <circle cx="32" cy="32" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M22 22L26 26" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="4" y="4" width="16" height="3" rx="1.5" fill="currentColor"/>
    <rect x="28" y="41" width="16" height="3" rx="1.5" fill="currentColor"/>
    <path d="M12 12v4M12 20v4M36 24v4M36 32v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// Base64 컨버터 - 인코딩/디코딩을 표현
export const Base64ConverterIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="6" y="8" width="36" height="32" rx="4" stroke="currentColor" strokeWidth="2"/>
    <path d="M14 16v16M22 16v16M30 16v16M38 16v16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="18" cy="20" r="2" fill="currentColor"/>
    <circle cx="26" cy="24" r="2" fill="currentColor"/>
    <circle cx="34" cy="20" r="2" fill="currentColor"/>
    <path d="M14 36h20" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M6 24h4M38 24h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 해시 생성기 - 보안과 암호화를 표현
export const HashGeneratorIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="24" r="8" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 8v8M40 24h-8M24 40v-8M8 24h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="24" cy="16" r="2" fill="currentColor"/>
    <circle cx="32" cy="24" r="2" fill="currentColor"/>
    <circle cx="24" cy="32" r="2" fill="currentColor"/>
    <circle cx="16" cy="24" r="2" fill="currentColor"/>
    <path d="M18 18L30 30M30 18L18 30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
)

// QR 생성기 - QR 코드를 직관적으로 표현
export const QrGeneratorIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="8" width="32" height="32" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="12" y="12" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="30" y="12" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="12" y="30" width="6" height="6" rx="1" fill="currentColor"/>
    <rect x="22" y="22" width="4" height="4" fill="currentColor"/>
    <rect x="28" y="28" width="2" height="2" fill="currentColor"/>
    <rect x="32" y="28" width="2" height="2" fill="currentColor"/>
    <rect x="34" y="32" width="2" height="2" fill="currentColor"/>
    <rect x="30" y="34" width="2" height="2" fill="currentColor"/>
    <rect x="20" y="32" width="2" height="2" fill="currentColor"/>
    <rect x="24" y="34" width="2" height="2" fill="currentColor"/>
  </svg>
)

// 그림판 - 페인팅과 창작을 표현
export const CanvasIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="10" width="32" height="28" rx="3" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="20" r="3" fill="none" stroke="currentColor" strokeWidth="2"/>
    <path d="M16 32c2-4 6-6 8-4s6 0 8 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="20" cy="18" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="18" r="1.5" fill="currentColor"/>
    <rect x="4" y="6" width="4" height="8" rx="2" fill="currentColor"/>
    <circle cx="6" cy="4" r="2" fill="currentColor"/>
  </svg>
)

// 갤러리 - 이미지 컬렉션을 표현
export const GalleryIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="6" y="6" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="26" y="6" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="6" y="26" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <rect x="26" y="26" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="2"/>
    <circle cx="12" cy="12" r="2" fill="currentColor"/>
    <path d="M8 18l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="32" cy="12" r="2" fill="currentColor"/>
    <path d="M28 18l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)

// AI 어시스턴트 - 인공지능과 대화를 표현
export const AiAssistantIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="20" r="12" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 18h12M18 22h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="20" cy="17" r="1" fill="currentColor"/>
    <circle cx="28" cy="17" r="1" fill="currentColor"/>
    <path d="M16 36c4-4 12-4 16 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="40" r="2" fill="currentColor"/>
    <circle cx="36" cy="40" r="2" fill="currentColor"/>
    <path d="M24 32v8M20 42h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 오늘의 한끼 - 음식과 추천을 표현
export const FoodRecommendIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="20" r="12" stroke="currentColor" strokeWidth="2"/>
    <path d="M18 16c2-2 4-2 6 0s4 2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="1.5" fill="currentColor"/>
    <circle cx="28" cy="20" r="1.5" fill="currentColor"/>
    <path d="M20 26c2 2 6 2 8 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="20" y="32" width="8" height="12" rx="1" stroke="currentColor" strokeWidth="2"/>
    <path d="M22 36h4M22 40h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="16" cy="12" r="2" fill="currentColor"/>
    <circle cx="32" cy="12" r="2" fill="currentColor"/>
    <circle cx="24" cy="8" r="2" fill="currentColor"/>
  </svg>
)

// 주사위 - 랜덤과 게임을 표현
export const DiceIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <rect x="8" y="8" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="2" transform="rotate(10 20 20)"/>
    <circle cx="18" cy="16" r="2" fill="currentColor" transform="rotate(10 20 20)"/>
    <circle cx="26" cy="16" r="2" fill="currentColor" transform="rotate(10 20 20)"/>
    <circle cx="22" cy="22" r="2" fill="currentColor" transform="rotate(10 20 20)"/>
    <circle cx="18" cy="28" r="2" fill="currentColor" transform="rotate(10 20 20)"/>
    <circle cx="26" cy="28" r="2" fill="currentColor" transform="rotate(10 20 20)"/>
    <path d="M34 34l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="40" cy="28" r="2" fill="currentColor"/>
  </svg>
)

// 사다리타기 - 사다리와 선택을 표현
export const LadderGameIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <path d="M12 8v32M20 8v32M28 8v32M36 8v32" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M12 14h8M20 18h8M28 22h8M12 26h8M20 30h8M28 34h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="6" r="2" fill="currentColor"/>
    <circle cx="20" cy="6" r="2" fill="currentColor"/>
    <circle cx="28" cy="6" r="2" fill="currentColor"/>
    <circle cx="36" cy="6" r="2" fill="currentColor"/>
    <rect x="10" y="40" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="18" y="40" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="26" y="40" width="4" height="4" rx="1" fill="currentColor"/>
    <rect x="34" y="40" width="4" height="4" rx="1" fill="currentColor"/>
  </svg>
)

// 룰렛 - 원형 선택기를 표현
export const RouletteIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2"/>
    <path d="M24 8L24 24L32 16" fill="currentColor"/>
    <path d="M24 8L24 24L16 16" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 40L24 24L32 32" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 40L24 24L16 32" fill="currentColor"/>
    <circle cx="24" cy="24" r="3" fill="currentColor"/>
    <path d="M24 4v4" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
    <polygon points="22,2 26,2 24,8" fill="currentColor"/>
  </svg>
)

// 동전 던지기 - 동전과 확률을 표현
export const CoinFlipIcon = ({ className = "", size = 24 }: IconProps) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none" className={className}>
    <circle cx="24" cy="24" r="12" stroke="currentColor" strokeWidth="2"/>
    <circle cx="24" cy="24" r="8" fill="none" stroke="currentColor" strokeWidth="1"/>
    <path d="M24 16v16M16 24h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <circle cx="24" cy="20" r="1" fill="currentColor"/>
    <circle cx="24" cy="28" r="1" fill="currentColor"/>
    <circle cx="20" cy="24" r="1" fill="currentColor"/>
    <circle cx="28" cy="24" r="1" fill="currentColor"/>
    <path d="M18 10c4-4 8-4 12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M30 38c-4 4-8 4-12 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

// 통합 아이콘 렌더러
export const renderPremiumIcon = (iconName: string, size = 24) => {
  const iconMap = {
    code: <JsonFormatterIcon size={size} />,
    edit: <VariableGeneratorIcon size={size} />,
    link: <UrlEncoderIcon size={size} />,
    'file-text': <Base64ConverterIcon size={size} />,
    shield: <HashGeneratorIcon size={size} />,
    'qr-code': <QrGeneratorIcon size={size} />,
    palette: <CanvasIcon size={size} />,
    grid: <GalleryIcon size={size} />,
    brain: <AiAssistantIcon size={size} />,
    food: <FoodRecommendIcon size={size} />,
    dice: <DiceIcon size={size} />,
    ladder: <LadderGameIcon size={size} />,
    wheel: <RouletteIcon size={size} />,
    coin: <CoinFlipIcon size={size} />
  }
  
  return iconMap[iconName as keyof typeof iconMap] || <JsonFormatterIcon size={size} />
}