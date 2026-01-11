# Personal Platform

개인 운영하는 웹서비스들과 다양한 유틸리티 기능들을 통합 관리하는 개인 플랫폼

## 프로젝트 구조

```
/
├── be/          # Backend (Node.js + Fastify + TypeScript)
├── fe/          # Frontend (Next.js + TypeScript)
└── docs/        # 프로젝트 문서
```

## 주요 기능

- 메인 홈페이지 (프로젝트 소개 및 네비게이션)
- 서브도메인별 독립 기능:
  - `tools.domain.com` - JSON formatter, 변수 생성기 등
  - `canvas.domain.com` - 그림판 애플리케이션
  - `admin.domain.com` - 관리 패널

## 개발 환경 설정

### Backend 실행
```bash
cd be
npm run dev
```

### Frontend 실행
```bash
cd fe
npm run dev
```

## 기술 스택

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Fastify, TypeScript, Zod
- **아키텍처**: 모노레포, 서브도메인 라우팅

자세한 내용은 `docs/` 디렉토리를 참고하세요.