# 🚀 배포 가이드 (2025)

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
   tools.domain.com → Cloudflare Pages (별도 프로젝트)
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
NEXT_PUBLIC_WS_URL=ws://localhost:8084
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