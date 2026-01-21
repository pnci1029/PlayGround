# PlayGround - 개발 도구 모음

개발에 필요한 다양한 도구들을 모아둔 웹 플랫폼

## 🚀 실행 방법

### Docker로 실행 (권장)

```bash
# 최초 실행 (이미지 빌드 + 실행)
docker-compose up -d --build

# 이후 실행 (기존 이미지로 실행)
docker-compose up -d

# 소스코드 변경 후 (새로 빌드 + 실행)  
docker-compose up -d --build

# 중지
docker-compose down
```

### 개별 실행

```bash
# 백엔드 (8000포트)
cd be
npm install
npm run dev

# 프론트엔드 (3000포트)
cd fe  
npm install
npm run dev
```

## 접속 주소

- **프론트엔드**: http://localhost:3000
- **백엔드**: http://localhost:8000
- **데이터베이스**: localhost:5432