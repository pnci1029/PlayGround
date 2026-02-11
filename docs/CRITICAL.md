# 🚨 CRITICAL INFORMATION

## 🔒 환경 변수

### 절대 커밋하면 안 되는 파일들
```bash
.env*
be/.env*
fe/.env*
```

### 필수 환경 변수

#### Backend (.env)
```bash
PORT=8000
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:8000
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🛡️ 보안 주의사항

### 절대 하면 안 되는 것들
1. **환경 변수를 코드에 하드코딩**
2. **API 키를 클라이언트에 노출**
3. **민감한 정보를 로그에 출력**

## 📁 절대 삭제하면 안 되는 파일들

```bash
# 프로젝트 루트
package.json (없으면 생성)
.gitignore
README.md

# 백엔드 핵심
be/src/index.ts
be/package.json
be/tsconfig.json

# 프론트엔드 핵심
fe/middleware.ts
fe/package.json
fe/tsconfig.json

# 문서
docs/CRITICAL.md
docs/architecture-guide.md

# 인프라 설정
caddy/Caddyfile
```

## 🔄 Caddy 리버스 프록시

### 핵심 기능
- 서브도메인별 서비스 라우팅 (admin.localhost, blog.localhost, moodbite.localhost 등)
- 백엔드/프론트엔드 자동 프록시 설정
- 개발환경(localhost)과 프로덕션(playground.com) 동시 지원
- SSL/TLS 자동 인증서 관리

## 🚀 개발 서버 실행

```bash
# Backend
cd be && npm run dev

# Frontend  
cd fe && npm run dev
```

## 📋 주요 기능 구현 계획

### 개발 도구 (tools.domain.com)
```
- JSON 포맷터 (완료)
- 변수명 생성기 (완료)
- URL 인코더/디코더 (예정)
- Base64 인코더 (예정)
- 해시 생성기 (예정)
- QR 코드 생성기 (예정)
```

### 다국어 지원
```
- 한국어/영어 토글 버튼
- 외국인 사용자 대응
- UI 텍스트 번역
- 도구 설명 다국어화
```

### 실시간 캔버스 (canvas.domain.com)
```
- 전체화면 공유 캔버스
- 실시간 다중 사용자 그리기
- 웹소켓 기반 동기화
- 색상/브러시 크기 선택
- 그림 저장/불러오기/버전 관리
```

### 익명 채팅 (chat.domain.com)
```
- 실시간 메시지 전송
- 익명 닉네임 + 랜덤 색상
- 웹소켓 기반 통신
- 채팅 기록 저장 (선택적)
```

## 🔧 기술 스택

### Frontend 기술
```
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- HTML5 Canvas (그림판)
- WebSocket (실시간 기능)
```

### Backend 기술
```
- Node.js + Fastify
- TypeScript
- WebSocket (@fastify/websocket)
- 파일 저장 (이미지, 채팅 로그)
- Zod (데이터 검증)
```