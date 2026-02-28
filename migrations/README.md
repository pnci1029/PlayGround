# 📄 Database Migrations

이 디렉토리는 모든 프로젝트의 SQL 스키마 파일을 간단하게 관리합니다.

## 📁 파일 구조

```
migrations/
├── playground.sql    # PlayGround 프로젝트 (모든 테이블)
├── trend.sql         # Trend 프로젝트 (모든 테이블) 
├── moodbite.sql      # MoodBite 프로젝트 (음식 데이터)
└── README.md         # 이 파일
```

## 🚀 사용법

각 SQL 파일을 직접 데이터베이스에 실행하거나, Claude에게 요청하여 실행할 수 있습니다.

### 예시
```sql
-- playground.sql 실행
\i migrations/playground.sql

-- 또는 Claude에게 요청
"playground.sql 실행해줘"
```

## 📝 각 파일 설명

- **playground.sql**: 사용자, 아트워크, 도구 통계 테이블
- **trend.sql**: 트렌드 데이터, 랭킹, 카테고리 테이블 (trend 스키마)
- **moodbite.sql**: 한국 음식 추천 데이터 (INSERT 문)

## ⚠️ 주의사항

이 파일들은 `.gitignore`에서 제외되므로 Git에 커밋되지 않습니다.
각 개발자는 로컬에서만 관리합니다.