# 🚀 배포 체크리스트 & 자동화 가이드

## 📋 배포 단계별 가이드

### 1단계: 사전 준비 (5분)
```bash
# 1. 빌드 테스트
cd fe && npm run build
cd ../be && npm run build

# 2. 환경변수 파일 생성
cp .env.example .env.production

# 3. Git 커밋 & 푸시
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2단계: 데이터베이스 설정 (3분)
1. **Neon 가입**: https://neon.tech
2. 프로젝트 생성 → PostgreSQL DB 생성
3. Connection String 복사 보관

### 3단계: 백엔드 배포 (5분)
1. **Koyeb 가입**: https://koyeb.com
2. GitHub 연결 → 저장소 선택
3. 배포 설정:
   ```
   Build Command: npm run build
   Run Command: npm start
   Port: 8082
   Root Directory: be/
   ```
4. 환경변수 설정:
   ```
   PORT=8082
   HOST=0.0.0.0
   DATABASE_URL=<neon_connection_string>
   ```

### 4단계: 프론트엔드 배포 (3분)
1. **Cloudflare Pages 가입**: https://pages.cloudflare.com
2. GitHub 연결 → 저장소 선택
3. 빌드 설정:
   ```
   Framework: Next.js
   Build Command: npm run build
   Output Directory: .next
   Root Directory: fe/
   ```
4. 환경변수 설정:
   ```
   NEXT_PUBLIC_API_URL=<koyeb_backend_url>
   ```

### 5단계: 도메인 설정 (10분)
1. Cloudflare DNS에서 도메인 관리
2. 서브도메인 설정:
   ```
   main.yourdomain.com → Cloudflare Pages
   api.yourdomain.com → Koyeb Backend
   tools.yourdomain.com → Cloudflare Pages (별도 프로젝트)
   ```

## 🤖 자동화 스크립트

### deploy.sh (전체 배포)
```bash
#!/bin/bash
set -e

echo "🚀 Starting deployment..."

# Build & Test
echo "📦 Building frontend..."
cd fe && npm run build
echo "📦 Building backend..."
cd ../be && npm run build

# Git operations
echo "📤 Pushing to GitHub..."
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || true
git push origin main

echo "✅ Deployment triggered! Check platforms:"
echo "- Frontend: Cloudflare Pages Dashboard"
echo "- Backend: Koyeb Dashboard"
```

### scripts/check-health.sh (헬스체크)
```bash
#!/bin/bash

FRONTEND_URL="https://yourdomain.com"
BACKEND_URL="https://api.yourdomain.com"

echo "🔍 Health Check..."

# Frontend check
if curl -f $FRONTEND_URL > /dev/null 2>&1; then
  echo "✅ Frontend: OK"
else
  echo "❌ Frontend: ERROR"
fi

# Backend check
if curl -f $BACKEND_URL/health > /dev/null 2>&1; then
  echo "✅ Backend: OK"
else
  echo "❌ Backend: ERROR"
fi
```

### scripts/update-env.sh (환경변수 업데이트)
```bash
#!/bin/bash

echo "🔧 Updating environment variables..."

# Cloudflare Pages (Frontend)
echo "Updating frontend env..."
# wrangler pages project upload env

# Koyeb (Backend)  
echo "Updating backend env..."
# koyeb services update <service-id>

echo "✅ Environment variables updated!"
```

## 📁 디렉토리 구조 정리
```
/
├── fe/                 # Frontend (Cloudflare Pages)
├── be/                 # Backend (Koyeb)
├── scripts/           # 배포 스크립트
│   ├── deploy.sh
│   ├── check-health.sh
│   └── update-env.sh
├── .env.example       # 환경변수 템플릿
└── docs/             # 문서들
```

## 🎯 배포 우선순위

### 즉시 시작 (필수)
1. ✅ **Neon DB 설정** (무료, 5분)
2. ✅ **Koyeb 백엔드** (무료, 10분)
3. ✅ **Cloudflare Pages** (무료, 5분)

### 나중에 할 것 (선택)
1. 🔄 **도메인 구매** ($3/월)
2. 📊 **모니터링 설정**
3. 🔒 **SSL 인증서** (Cloudflare 무료)

## ⚡ Quick Start 명령어
```bash
# 1. 스크립트 권한 설정
chmod +x scripts/*.sh

# 2. 전체 배포 실행
./scripts/deploy.sh

# 3. 상태 확인
./scripts/check-health.sh
```

## 🔧 트러블슈팅

### 빌드 실패 시
- Node.js 버전 확인 (20+)
- 패키지 재설치: `rm -rf node_modules package-lock.json && npm install`

### 연결 실패 시
- CORS 설정 확인 (be/src/config/index.ts)
- 환경변수 URL 확인

### DB 연결 실패 시
- Neon connection string 형식 확인
- 방화벽 설정 확인 (Neon은 기본 허용)
