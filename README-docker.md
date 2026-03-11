# Docker Compose 사용 가이드

## 📦 개별 서비스 실행

### PlayGround (메인 서비스)
```bash
docker-compose -f docker-compose.playground.yml up -d
# 접속: http://localhost (nginx), http://localhost:3000 (직접)
```

### MoodBite
```bash
docker-compose -f docker-compose.moodbite.yml up -d
# 접속: http://localhost:3001 (프론트엔드), http://localhost:8082 (백엔드)
```

### Trend
```bash
docker-compose -f docker-compose.trend.yml up -d
# 접속: http://localhost:3002 (프론트엔드), http://localhost:8002 (백엔드)
```

### Blog
```bash
docker-compose -f docker-compose.blog.yml up -d
# 접속: http://localhost:3003 (프론트엔드), http://localhost:8003 (백엔드)
```

## 🌐 전체 서비스 실행 (통합 배포용)
```bash
docker-compose up -d
# Caddy 리버스 프록시로 서브도메인 라우팅
```

## 🔧 유용한 명령어

### 특정 서비스만 중지
```bash
docker-compose -f docker-compose.playground.yml down
```

### 로그 확인
```bash
docker-compose -f docker-compose.playground.yml logs -f
```

### 빌드 후 실행
```bash
docker-compose -f docker-compose.playground.yml up -d --build
```

### 데이터베이스만 실행
```bash
docker-compose -f docker-compose.playground.yml up -d postgres
```

## 📁 파일 구조
- `docker-compose.yml` - 전체 서비스 (배포용)
- `docker-compose.playground.yml` - PlayGround만
- `docker-compose.moodbite.yml` - MoodBite만  
- `docker-compose.trend.yml` - Trend만
- `docker-compose.blog.yml` - Blog만

## ⚠️ 주의사항
- 모든 개별 서비스는 같은 PostgreSQL을 공유합니다
- 개별 실행시 포트 충돌 방지를 위해 다른 포트를 사용합니다
- nginx는 playground에서만 포트 80을 사용합니다