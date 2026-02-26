# 🚀 인프라 가이드 (2025)

## 🌐 서브도메인 아키텍처

### 로컬 개발 환경
```
http://localhost:3000              → Playground 메인 (직접 접근)
https://localhost                  → Playground 메인 (Caddy 프록시)
https://moodbite.localhost         → MoodBite (음식 추천)
https://trend.localhost            → Trend (트렌드 분석)
https://blog.localhost             → Blog (개인 블로그)
```

### 프로덕션 환경
```
https://yourdomain.com             → Playground 메인
https://moodbite.yourdomain.com    → MoodBite 
https://trend.yourdomain.com       → Trend
https://blog.yourdomain.com        → Blog
```

### 🔧 hosts 파일 설정 (로컬 개발)
다음을 `/etc/hosts` (macOS/Linux) 또는 `C:\Windows\System32\drivers\etc\hosts` (Windows)에 추가:
```bash
127.0.0.1 moodbite.localhost
127.0.0.1 trend.localhost
127.0.0.1 blog.localhost
```

## 📋 포트 할당 컨벤션

### 서비스별 포트 매핑
| 서비스 | Frontend | Backend API | WebSocket | 실제 포트 | 비고 |
|--------|----------|-------------|-----------|-----------|------|
| **Playground** | 3000 | 8000 | 8010 | 3000 | 메인 서비스 |
| **MoodBite** | expose only | 8082 | 8084 | 3000 (내부) | 음식 추천 |
| **Trend** | expose only | 8002 | 8012 | 3002 (내부) | 트렌드 분석 |
| **Blog** | expose only | 8003 | 8013 | 3003 (내부) | 개인 블로그 |

### 기타 포트
- **PostgreSQL**: 5432
- **Caddy Proxy**: 80, 443

### 환경변수 설정 원칙
- **클라이언트사이드**: 서브도메인 또는 `/api` 프록시 사용
- **서버사이드**: Docker 컨테이너 이름으로 통신
- **URL 중앙 관리**: `.env` 파일에서 모든 서비스 URL 관리

## 🔐 환경변수 설정

### 메인 환경변수 파일 (/.env)
```bash
# Base domain configuration
BASE_DOMAIN=localhost

# Service URLs (로컬 개발)
PLAYGROUND_URL=http://localhost:3000
MOODBITE_URL=https://moodbite.localhost
TREND_URL=https://trend.localhost
BLOG_URL=https://blog.localhost

# Service URLs (프로덕션 - 주석 해제하고 도메인 변경)
# PLAYGROUND_URL=https://yourdomain.com
# MOODBITE_URL=https://moodbite.yourdomain.com  
# TREND_URL=https://trend.yourdomain.com
# BLOG_URL=https://blog.yourdomain.com

# Database configuration
POSTGRES_DB=playground
POSTGRES_USER=postgres
POSTGRES_PASSWORD=password

# JWT configuration
JWT_SECRET=please_change_this_jwt_secret_in_production
```

### Docker Compose 환경변수
각 프론트엔드 서비스에 자동으로 전달되는 환경변수들:
```bash
# Playground Frontend
NEXT_PUBLIC_PLAYGROUND_URL=${PLAYGROUND_URL}
NEXT_PUBLIC_MOODBITE_URL=${MOODBITE_URL}
NEXT_PUBLIC_TREND_URL=${TREND_URL}
NEXT_PUBLIC_BLOG_URL=${BLOG_URL}

# Backend Container URLs (서버사이드 통신)
BACKEND_CONTAINER_URL=http://playground_backend:8000
BACKEND_API_PREFIX=/api
```

### 환경변수 사용법
```typescript
// playground/fe/src/lib/config.ts
export const config = {
  services: {
    playground: process.env.NEXT_PUBLIC_PLAYGROUND_URL || 'http://localhost:3000',
    moodbite: process.env.NEXT_PUBLIC_MOODBITE_URL || 'https://moodbite.localhost',
    trend: process.env.NEXT_PUBLIC_TREND_URL || 'https://trend.localhost',
    blog: process.env.NEXT_PUBLIC_BLOG_URL || 'https://blog.localhost',
  },
}

// 컴포넌트에서 사용
import { config } from '@/lib/config'
<a href={config.services.moodbite}>MoodBite으로 이동</a>
```

## 💡 최선책 종합 가이드

| 구분 | 1순위 | 2순위 | 3순위 |
|------|-------|-------|-------|
| **Frontend** | Cloudflare Pages | Vercel | Netlify |
| **Backend** | Koyeb | Render | Cloudflare Workers |
| **Database** | Neon | Supabase | MongoDB Atlas |
| **Images** | Cloudflare R2 | Supabase Storage | - |

### 🥇 최고 조합 (완전 무료)
```
✅ Frontend: Cloudflare Pages (무제한)
✅ Backend: Koyeb (512MB, PostgreSQL 포함)
✅ Database: Neon (3GB)
✅ Images: Cloudflare R2 (10GB)
✅ DNS: Cloudflare (서브도메인 무료)
```

### 🥈 간편 조합 (Next.js)
```
✅ All-in-One: Vercel (Frontend + Backend API)
✅ Database: Supabase (500MB, Auth 포함)
✅ Images: Supabase Storage (1GB)
```

---

## 백엔드 호스팅 추천 순위

### 1위. Koyeb ⭐⭐⭐⭐⭐
- **무료 기간**: 영구 무료 (신용카드 불필요)
- **스펙**: 512MB RAM, 0.1 vCPU, 2GB SSD
- **포함**: PostgreSQL DB, 100GB 대역폭/월, 5개 커스텀 도메인
- **장점**: 제한 초과시 점진적 과금 (중단 없음)
- **단점**: 프랑크푸르트/워싱턴 지역만
- **URL**: https://koyeb.com

### 2위. Render ⭐⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 750시간/월 (충분함)
- **장점**: 안정적, 예측 가능
- **단점**: 15분 비활성시 sleep, DB 별도 필요
- **URL**: https://render.com

### 3위. Cloudflare Workers ⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 10만 요청/일, 10ms CPU 시간
- **장점**: 글로벌 엣지 배포 (빠름)
- **단점**: Fastify → Worker API 코드 변경 필요
- **URL**: https://workers.cloudflare.com

### 4위. Vercel (API Routes) ⭐⭐
- **무료 기간**: 영구 무료
- **장점**: Next.js 통합 편리
- **단점**: 제한 초과시 완전 중단 위험, 월 2만 방문자 한계
- **URL**: https://vercel.com

## 데이터베이스 호스팅

### 1위. Neon ⭐⭐⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 3GB 저장소, 월 100 CU-시간
- **장점**: 자동 휴면, scale-to-zero
- **URL**: https://neon.tech

### 2위. Supabase ⭐⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 500MB DB, 1GB 파일, 5만 MAU
- **장점**: 백엔드 서비스 통합 (Auth, 실시간)
- **URL**: https://supabase.com

## 프론트엔드 호스팅

### 1위. Cloudflare Pages ⭐⭐⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 무제한 대역폭 (정적), 100만 요청/월
- **장점**: 제한 초과시 중단 없음, 서브도메인 무료
- **URL**: https://pages.cloudflare.com

### 2위. Vercel ⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 100GB 대역폭, 100GB-시간
- **단점**: 제한 초과시 완전 중단
- **URL**: https://vercel.com

## 이미지/파일 저장소

### 1위. Cloudflare R2 ⭐⭐⭐⭐⭐
- **무료 기간**: 영구 무료
- **스펙**: 10GB 저장소, 100만 업로드/월
- **장점**: 무료 egress, AWS S3 호환
- **URL**: https://developers.cloudflare.com/r2/

## 추천 조합

### 🥇 가장 안전한 조합 (완전 무료)
```
Frontend: Cloudflare Pages
Backend: Koyeb
Database: Neon
Images: Cloudflare R2
도메인 관리: Cloudflare DNS
```

### 🥈 간단한 조합 (Next.js)
```
Frontend + Backend: Vercel (API Routes)
Database: Supabase
Images: Supabase Storage
```

## 피해야 할 플랫폼들

- **Railway**: 30일 후 무조건 $5/월
- **Fly.io**: 2025년부터 무료 티어 없음  
- **Glitch**: 2025년 7월 서비스 종료
- **Cyclic**: 2024년 이미 서비스 종료

## 서브도메인 설정 (Cloudflare)

1. Cloudflare에서 도메인 추가
2. DNS 레코드 설정:
   ```
   main.domain.com → Cloudflare Pages
   api.domain.com → Koyeb
   moodbite.domain.com → Cloudflare Pages (별도 프로젝트)
   trend.domain.com → Cloudflare Pages (별도 프로젝트)
   blog.domain.com → Cloudflare Pages (별도 프로젝트)
   ```
3. SSL 자동 설정
4. 무료 CDN 적용

## 예상 비용

**완전 무료 단계**:
- 모든 서비스 무료 티어 사용
- 월 0원

**성장 후 (~$10/월)**:
- 도메인: $3/월
- 확장 서비스: $5-7/월

## 🔗 환경변수 및 API 공통화 설정

### 🚨 배포 전 필수 작업

#### 1. 환경변수 설정
각 플랫폼에서 다음 환경변수들을 설정해야 합니다:

**Frontend (Cloudflare Pages/Vercel)**:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_PREFIX=/api
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=PlayGround
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**Backend (Koyeb/Render)**:
```bash
PORT=8085
NODE_ENV=production
DATABASE_URL=your_neon_connection_string
CORS_ORIGINS=https://yourdomain.com,https://tools.yourdomain.com
```

#### 2. API URL 검증
배포 전에 다음 사항을 반드시 확인:

```bash
# 하드코딩된 URL이 있는지 검사
grep -r "localhost:808" src/
grep -r "http://localhost" src/

# 모든 결과가 0이어야 함!
```

#### 3. 도메인별 환경변수 예시

**개발환경 (.env.local)**:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8085
NEXT_PUBLIC_WS_URL=ws://localhost:8010
```

**스테이징 환경**:
```bash
NEXT_PUBLIC_API_URL=https://api-staging.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api-staging.yourdomain.com
```

**프로덕션 환경**:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
NEXT_PUBLIC_WS_URL=wss://api.yourdomain.com
```

### 🔧 배포 체크리스트

- [ ] `src/lib/config.ts` 파일이 올바르게 구성되어 있는가?
- [ ] 모든 API 호출이 `apiUrls.*` 함수를 사용하는가?
- [ ] 모든 이미지 URL이 `imageUrls.*` 함수를 사용하는가?
- [ ] 환경변수가 각 플랫폼에 올바르게 설정되었는가?
- [ ] CORS 설정이 프론트엔드 도메인을 포함하는가?
- [ ] WebSocket URL이 HTTPS 환경에서 WSS를 사용하는가?

## 주의사항

- **API URL 하드코딩 절대 금지**: 환경변수와 헬퍼 함수만 사용
- Vercel은 트래픽 급증 시 갑작스런 서비스 중단 위험
- 프로덕션 환경에서는 모니터링과 백업 필수
- 무료 티어 제한을 정기적으로 확인
- 환경변수 변경 후 반드시 재배포 필요