# Personal Platform Project

## 프로젝트 개요
개인 운영하는 웹서비스들과 다양한 유틸리티 기능들을 통합 관리하는 개인 플랫폼

## 주요 기능
- 메인 홈페이지 (기존 프로젝트 소개, 네비게이션)
- 서브도메인별 독립 기능
  - tools.domain.com (JSON formatter, 변수 생성기 등)
  - canvas.domain.com (그림판)
  - admin.domain.com (관리 패널)
- 외부 도메인 연결/리다이렉션

## 기술 스택
- **Frontend**: Next.js + TypeScript
- **Backend**: Node.js + Fastify + TypeScript
- **Architecture**: 모노레포 + 서브도메인 라우팅

## 디렉토리 구조
```
/
├── fe/          # Frontend (Next.js)
├── be/          # Backend (Node.js + Fastify)  
└── docs/        # 프로젝트 문서
```

## AI 개발 컨텍스트
이 문서를 참고하여 바이브 코딩 시:
1. TypeScript 일관성 유지
2. 서브도메인별 독립적 개발
3. 공통 컴포넌트 재사용
4. API 통합 설계