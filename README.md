# 🚀 PlayGround - 개인 도구 모음 & 멀티 프로젝트 플랫폼

> 내가 필요해서 만든 모든 것

개발 도구들과 개인 프로젝트들을 서브도메인으로 관리하는 플랫폼입니다.

## 📦 포함된 도구들

- **JSON 포맷터** - JSON 정리, 압축, 유효성 검사
- **변수명 생성기** - camelCase, snake_case 등 변환
- **URL 인코더/디코더** - URL 인코딩 변환
- **Base64 인코더/디코더** - Base64 변환
- **해시 생성기** - SHA-1, SHA-256, SHA-512
- **QR 코드 생성기** - 텍스트/URL → QR 코드
- **실시간 그림판** - WebSocket 기반 협업 캔버스
- **익명 채팅** - 실시간 채팅방

## 🏗️ 아키텍처

```
playground.com               # 메인 도구 사이트
├── admin.playground.com     # 관리자 패널
├── blog.playground.com      # 개인 블로그
├── menu.playground.com      # 맛집 추천 (예정)
└── diary.playground.com     # AI 일기 (예정)
```

## 🚀 로컬 개발 환경 시작하기

### 🐳 Docker로 한번에 실행 (추천)
```bash
# 1. 레포지토리 클론
git clone <repo-url>
cd PlayGround

# 2. 한번에 실행
./start.sh

# 또는 수동 실행
docker-compose up --build -d
```

### 📝 개별 설치 방법

#### 1. 사전 요구사항
- Node.js 18+
- Docker Desktop
- Git

#### 2. 레포지토리 클론
```bash
git clone <repo-url>
cd PlayGround
```

### 3. PostgreSQL 컨테이너 시작
```bash
# PostgreSQL 컨테이너 시작
docker-compose -f docker-compose.dev.yml up -d

# 컨테이너 상태 확인
docker-compose -f docker-compose.dev.yml ps
```

### 4. 환경 변수 설정
```bash
# 백엔드 환경 변수
cd be
cp .env.example .env

# 프론트엔드 환경 변수
cd ../fe  
cp .env.example .env.local
```

### 5. 데이터베이스 초기화
```bash
cd be

# 의존성 설치
npm install

# 데이터베이스 마이그레이션 + 기본 관리자 생성
npm run db:init
```

### 6. 서브도메인 설정 (선택사항)
로컬에서 서브도메인 테스트를 원하면:

```bash
# /etc/hosts 파일에 추가
sudo vim /etc/hosts

# 다음 라인들 추가:
127.0.0.1   admin.localhost
127.0.0.1   blog.localhost
127.0.0.1   menu.localhost
127.0.0.1   diary.localhost
```

### 7. 개발 서버 시작
```bash
# 터미널 1: 백엔드
cd be
npm run dev        # http://localhost:8085

# 터미널 2: 프론트엔드  
cd fe
npm run dev        # http://localhost:3002
```

## 🔐 기본 관리자 계정

```
URL: http://admin.localhost:3002 또는 http://localhost:3002/admin
Username: admin
Password: admin123
```

## 🛠️ 주요 명령어

### 데이터베이스
```bash
cd be

# 데이터베이스 초기화 (테이블 생성 + 기본 관리자)
npm run db:init

# 마이그레이션만 실행
npm run db:migrate

# 데이터베이스 리셋 (주의!)
npm run db:reset
```

### 개발 도구
```bash
# 백엔드
cd be
npm run dev          # 개발 서버
npm run build        # 빌드
npm run type-check   # 타입 체크

# 프론트엔드
cd fe  
npm run dev          # 개발 서버
npm run build        # 빌드
npm run lint         # 린트 체크
```

### Docker 관리
```bash
# PostgreSQL 컨테이너 시작
docker-compose -f docker-compose.dev.yml up -d

# 컨테이너 중지
docker-compose -f docker-compose.dev.yml down

# 볼륨까지 삭제 (데이터 초기화)
docker-compose -f docker-compose.dev.yml down -v
```

## 🌐 접속 주소

### 로컬 개발
- **메인 사이트**: http://localhost:3002
- **관리자**: http://localhost:3002/admin 또는 http://admin.localhost:3002
- **백엔드 API**: http://localhost:8085/api
- **PostgreSQL**: localhost:5432

### 서브도메인 (hosts 설정 후)
- **관리자**: http://admin.localhost:3002
- **블로그**: http://blog.localhost:3002 (예정)

## 🐛 트러블슈팅

### PostgreSQL 연결 실패
```bash
# 컨테이너 상태 확인
docker-compose -f docker-compose.dev.yml ps

# 로그 확인
docker-compose -f docker-compose.dev.yml logs postgres

# 컨테이너 재시작
docker-compose -f docker-compose.dev.yml restart postgres
```

### 포트 충돌
- 백엔드: 8085 포트 사용
- 프론트엔드: 3002 포트 사용  
- PostgreSQL: 5432 포트 사용

```bash
# 포트 사용 확인
lsof -ti:8085
lsof -ti:3002  
lsof -ti:5432

# 프로세스 종료
kill -9 <PID>
```

### 서브도메인 안됨
1. `/etc/hosts` 파일 확인
2. 브라우저 캐시 삭제
3. `localhost:3002/admin` 으로 우회 접속

## 📝 TODO

- [ ] 블로그 시스템 구현
- [ ] 프로젝트 배포 자동화
- [ ] SSL 인증서 자동 발급
- [ ] 모니터링 대시보드
- [ ] 백업 시스템

---

> ⚠️ 개발 환경에서만 사용하세요. 프로덕션 배포 시 보안 설정 필수!