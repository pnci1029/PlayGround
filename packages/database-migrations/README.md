# 🗄️ Database Migrations

중앙 집중식 데이터베이스 마이그레이션 패키지입니다. 각 프로젝트별로 하나의 SQL 파일로 모든 스키마를 통합 관리합니다.

## 📁 구조

```
packages/database-migrations/
├── src/
│   ├── migrations/          # 프로젝트별 통합 SQL 파일
│   │   ├── playground.sql   # PlayGround 프로젝트 모든 테이블
│   │   └── trend.sql        # Trend 프로젝트 모든 테이블
│   └── migrate.ts           # 마이그레이션 실행 스크립트
├── package.json
└── README.md
```

## 🚀 사용법

### 환경 설정
```bash
# .env 파일 생성
cp .env.example .env

# 데이터베이스 정보 수정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=playground
DB_USER=postgres
DB_PASSWORD=your_password
```

### 마이그레이션 실행
```bash
# 특정 프로젝트 스키마 실행
npm run dev playground.sql  # PlayGround 스키마만
npm run dev trend.sql       # Trend 스키마만

# 모든 프로젝트 스키마 실행
npm run dev

# 프로덕션용 (빌드 후 실행)
npm run build
npm run migrate playground.sql

# 마이그레이션 목록 확인
npm run dev list

# 특정 마이그레이션 롤백
npm run dev rollback playground.sql
```

## 🔧 서비스별 사용

### playground/be
```bash
cd playground/be
npm run db:migrate         # playground.sql 실행
```

### trend/trend_be  
```bash
cd trend/trend_be
npm run db:migrate         # trend.sql 실행
```

## 📋 프로젝트별 SQL 파일 구조

### playground.sql
- **사용자 관리**: users, tool_usage_logs
- **아트워크**: artworks, artwork_likes, artwork_history  
- **도구 통계**: tool_stats, daily_tool_visits
- 모든 테이블, 인덱스, 트리거를 하나의 파일로 통합 관리

### trend.sql
- **trend 스키마**: 독립적인 네임스페이스
- **트렌드 데이터**: trends, trend_history, categories
- **랭킹 시스템**: trending_rankings, trending_stats_hourly
- **설정 관리**: source_configs, keyword_synonyms
- 모든 테이블, 뷰, 함수를 하나의 파일로 통합 관리

## 🔄 마이그레이션 관리

1. 이미 실행된 마이그레이션은 체크섬으로 관리
2. 파일 변경 시 재실행되지 않음 (안전성)  
3. 각 프로젝트는 독립적으로 마이그레이션 가능
4. 중복 실행 방지를 위한 `IF NOT EXISTS` 사용

## ✅ 기능

- ✅ 자동 마이그레이션 테이블 생성
- ✅ 파일 체크섬으로 중복 실행 방지
- ✅ 트랜잭션 기반 안전한 실행
- ✅ 롤백 기능
- ✅ 실행 이력 조회
- ✅ 멀티 스테이트먼트 지원