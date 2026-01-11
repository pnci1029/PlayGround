# 아키텍처 & 개발 가이드

## 전체 아키텍처

### 시스템 구조
```
Frontend (Next.js) ←→ Backend (Node.js + Fastify)
       ↓
서브도메인 라우팅
  ├── main.domain.com     (메인 홈페이지)
  ├── tools.domain.com    (유틸리티 도구들)
  ├── canvas.domain.com   (그림판)
  └── admin.domain.com    (관리 패널)
```

## Frontend 아키텍처: Feature-based Architecture

### 디렉토리 구조
```
fe/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (main)/             # 메인 페이지
│   │   ├── tools/              # 도구 기능들
│   │   │   ├── json-formatter/
│   │   │   └── variable-generator/
│   │   ├── canvas/             # 그림판
│   │   └── admin/              # 관리 패널
│   ├── components/             # 공통 컴포넌트
│   │   ├── ui/                 # 기본 UI 컴포넌트
│   │   ├── layout/             # 레이아웃 컴포넌트
│   │   └── common/             # 공통 비즈니스 컴포넌트
│   ├── features/               # 기능별 모듈
│   │   ├── tools/
│   │   │   ├── components/     # 도구 전용 컴포넌트
│   │   │   ├── hooks/          # 도구 전용 훅
│   │   │   └── types/          # 도구 전용 타입
│   │   └── canvas/
│   ├── lib/                    # 공통 라이브러리
│   │   ├── api.ts              # API 클라이언트
│   │   ├── utils.ts            # 유틸리티 함수
│   │   └── store.ts            # 전역 상태 관리
│   ├── hooks/                  # 공통 훅
│   └── types/                  # 공통 타입
└── middleware.ts               # 서브도메인 라우팅
```

### Frontend 패턴
- **컴포넌트**: 단일 책임 원칙
- **훅**: 로직 재사용성
- **상태관리**: Zustand (가벼운 전역 상태)
- **타입**: TypeScript 엄격 모드

## Backend 아키텍처: MVC + Service Layer

### 디렉토리 구조
```
be/
├── src/
│   ├── routes/                 # HTTP 라우트
│   │   ├── tools/
│   │   ├── canvas/
│   │   └── admin/
│   ├── controllers/            # 컨트롤러 (요청 처리)
│   │   ├── toolsController.ts
│   │   ├── canvasController.ts
│   │   └── adminController.ts
│   ├── services/               # 서비스 레이어 (비즈니스 로직)
│   │   ├── toolsService.ts
│   │   ├── canvasService.ts
│   │   └── adminService.ts
│   ├── models/                 # 데이터 모델
│   │   ├── toolsModel.ts
│   │   ├── canvasModel.ts
│   │   └── adminModel.ts
│   ├── middleware/             # 미들웨어
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── utils/                  # 유틸리티 함수
│   ├── types/                  # TypeScript 타입
│   ├── config/                 # 설정 파일
│   └── plugins/                # Fastify 플러그인
└── index.ts                    # 엔트리 포인트
```

### MVC 패턴 설명

#### 레이어별 역할
1. **Routes**: URL과 컨트롤러 매핑
2. **Controllers**: HTTP 요청/응답 처리, 검증
3. **Services**: 비즈니스 로직, 복잡한 연산
4. **Models**: 데이터 구조, DB 연동

## 기술 스택 세부사항

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **UI Library**: shadcn/ui (선택적)
- **Form**: React Hook Form + Zod

### Backend
- **Framework**: Fastify
- **Language**: TypeScript (Strict Mode)
- **Database**: SQLite → PostgreSQL (확장 시)
- **ORM**: Prisma (추천)
- **Validation**: Zod
- **Authentication**: JWT
- **Testing**: Jest + Supertest

## 개발 패턴 & 규칙

### API 설계 패턴
```typescript
// 표준 API 응답
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// RESTful 라우팅
GET    /api/tools          # 목록 조회
POST   /api/tools          # 생성
GET    /api/tools/:id      # 단일 조회
PUT    /api/tools/:id      # 전체 수정
PATCH  /api/tools/:id      # 부분 수정
DELETE /api/tools/:id      # 삭제
```

### 명명 규칙
- **파일**: kebab-case (json-formatter.tsx)
- **컴포넌트**: PascalCase (JsonFormatter)
- **함수/변수**: camelCase (handleSubmit)
- **상수**: UPPER_SNAKE_CASE (API_BASE_URL)
- **타입/인터페이스**: PascalCase (ApiResponse)

### 서브도메인 개발 패턴
1. `fe/src/app/[subdomain]/` 페이지 생성
2. `fe/src/features/[subdomain]/` 기능 모듈 생성
3. `be/src/presentation/routes/[subdomain]/` API 라우트 생성
4. `be/src/domain/[subdomain]/` 도메인 로직 생성

## 개발 환경 설정

### 필수 명령어
```bash
# Frontend 개발 서버
cd fe && npm run dev           # http://localhost:3000

# Backend 개발 서버
cd be && npm run dev           # http://localhost:8000

# 타입 체크
npm run type-check

# 빌드
npm run build

# 테스트
npm run test
```

### 환경 변수 관리
- `.env.local` (로컬 개발)
- `.env.production` (프로덕션)
- **절대 커밋 금지**: `.env.*` 파일들

## AI 개발 시 참고사항

### 개발 원칙
1. **타입 안전성**: TypeScript 엄격 모드 준수
2. **단일 책임**: 각 모듈은 하나의 책임만
3. **의존성 역전**: 인터페이스를 통한 의존성 주입
4. **재사용성**: 공통 컴포넌트/훅 최대 활용
5. **성능**: Next.js 최적화 기능 활용

### 코드 작성 규칙
- 새 기능 추가 시 기존 아키텍처 패턴 따르기
- 공통 타입은 `shared/types/`에서 관리
- 에러 처리는 일관된 패턴 사용
- 비즈니스 로직은 도메인 레이어에 집중

### 확장 시 고려사항
- 마이크로서비스 전환 가능한 구조
- 데이터베이스 분리 가능한 도메인 설계
- 캐싱 레이어 추가 가능한 아키텍처