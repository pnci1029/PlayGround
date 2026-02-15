import { renderPremiumIcon } from '@/components/ui/PremiumIcons'

export interface Tool {
  title: string
  href: string
  category: string
  icon: React.ReactNode
  status: 'active' | 'beta' | 'coming-soon'
  description: string
  isExternal?: boolean
}

export interface ToolCategories {
  [key: string]: Tool[]
}

// 프리미엄 도구 데이터 - FreeTools.org 스타일
export const toolCategories: ToolCategories = {
  '개발 도구': [
    {
      title: 'JSON Formatter',
      href: '/tools/json-formatter',
      category: '개발 도구',
      icon: renderPremiumIcon('code'),
      status: 'active',
      description: 'JSON 데이터를 깔끔하게 포맷하고 유효성을 검사합니다'
    },
    {
      title: 'Variable Generator',
      href: '/tools/variable-generator', 
      category: '개발 도구',
      icon: renderPremiumIcon('edit'),
      status: 'active',
      description: '다양한 명명 규칙으로 변수명을 자동 생성합니다'
    },
    {
      title: 'URL Encoder',
      href: '/tools/url-encoder',
      category: '개발 도구', 
      icon: renderPremiumIcon('link'),
      status: 'active',
      description: 'URL을 안전하게 인코딩하고 디코딩합니다'
    },
    {
      title: 'Base64 Converter',
      href: '/tools/base64',
      category: '개발 도구',
      icon: renderPremiumIcon('file-text'),
      status: 'active',
      description: '텍스트와 파일을 Base64로 변환합니다'
    },
    {
      title: 'Hash Generator',
      href: '/tools/hash',
      category: '개발 도구',
      icon: renderPremiumIcon('shield'),
      status: 'active',
      description: 'SHA256, MD5 등 다양한 해시를 생성합니다'
    },
    {
      title: 'QR Code Generator',
      href: '/tools/qr-generator',
      category: '개발 도구',
      icon: renderPremiumIcon('qr-code'),
      status: 'active',
      description: '텍스트와 URL을 QR 코드로 변환합니다'
    }
  ],
  
  '창작 도구': [
    {
      title: '캔버스',
      href: '/canvas',
      category: '창작 도구',
      icon: renderPremiumIcon('palette'),
      status: 'beta',
      description: '자유롭게 그림을 그리고 창작할 수 있는 디지털 캔버스'
    },
    {
      title: '갤러리',
      href: '/gallery',
      category: '창작 도구', 
      icon: renderPremiumIcon('grid'),
      status: 'active',
      description: '작품들을 아름답게 정리하고 감상할 수 있는 갤러리'
    }
  ],

  '생활 도구': [
    {
      title: '오늘의 한끼',
      href: 'http://moodbite.localhost',
      category: '생활 도구',
      icon: renderPremiumIcon('food'),
      status: 'active',
      isExternal: true,
      description: '기분에 맞는 음식을 추천받아보세요'
    }
  ],
  
  '재미 도구': [
    {
      title: '주사위 굴리기',
      href: '/tools/dice',
      category: '재미 도구',
      icon: renderPremiumIcon('dice'),
      status: 'active',
      description: '3D 주사위로 랜덤한 숫자를 뽑아보세요'
    },
    {
      title: '사다리타기',
      href: '/tools/ladder',
      category: '재미 도구',
      icon: renderPremiumIcon('ladder'),
      status: 'active',
      description: '공정한 선택을 위한 전통적인 사다리타기 게임'
    },
    {
      title: '룰렛 돌리기',
      href: '/tools/wheel',
      category: '재미 도구',
      icon: renderPremiumIcon('wheel'),
      status: 'active',
      description: '커스터마이징 가능한 룰렛으로 선택해보세요'
    },
    {
      title: '동전 던지기',
      href: '/tools/coin',
      category: '재미 도구',
      icon: renderPremiumIcon('coin'),
      status: 'active',
      description: '3D 동전으로 간단한 선택을 결정해보세요'
    }
  ],

  '정보 도구': [
    {
      title: '실시간 트렌드',
      href: 'http://localhost:3002',
      category: '정보 도구',
      icon: renderPremiumIcon('trending-up'),
      status: 'active',
      isExternal: true,
      description: '전 세계 실시간 트렌드를 무료로 확인하세요'
    }
  ],

  '커뮤니케이션': [
    {
      title: '실시간 채팅',
      href: '/chat',
      category: '커뮤니케이션',
      icon: renderPremiumIcon('brain'),
      status: 'active',
      description: '실시간으로 다른 사용자들과 채팅할 수 있습니다'
    }
  ]
}