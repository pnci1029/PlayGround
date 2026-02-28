# Ignored Files Documentation

이 문서는 `.gitignore`에 추가되어 버전 관리에서 제외된 중요한 파일들을 관리합니다.

## 🔒 보안/민감 정보 파일들

### 환경 설정 파일
```
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```
**용도**: 데이터베이스 연결 정보, API 키 등 민감한 환경 변수  
**위치**: 각 프로젝트 루트  
**보유자**: 개발자 개인  

### 인증서/키 파일
```
*.pem
*.key
*.crt
jwt-secret*
```
**용도**: SSL 인증서, JWT 시크릿 키 등 보안 키  
**위치**: 프로젝트별 상이  
**보유자**: 개발자 개인  

## 📊 데이터 파일들

### MoodBite 음식 데이터
```
moodbite/**/foods.json
**/data/foods.json
```
**용도**: 음식 추천 시스템의 상세 데이터  
**위치**: `moodbite/MoodBite_BE/src/main/resources/data/foods.json`  
**보유자**: 개발자 개인  
**비고**: 대용량 JSON 파일로 개발/테스트용 데이터 포함

### 데이터베이스 마이그레이션
```
migrations/*.sql
```
**용도**: 데이터베이스 스키마 생성/변경 SQL  
**위치**: `./migrations/` 디렉토리  
**보유자**: 개발자 개인  
**비고**: 실제 스키마 정보 포함으로 보안상 제외

## 🏗️ 빌드/임시 파일들

### 의존성 및 빌드
```
node_modules/
dist/
build/
.next/
```
**용도**: 패키지 의존성 및 빌드 결과물  
**자동 생성**: npm install, npm run build 시 생성  

### 개발 도구 캐시
```
*.tsbuildinfo
.eslintcache
.stylelintcache
```
**용도**: 타입스크립트, 린터 캐시 파일  
**자동 생성**: 개발 도구 실행 시 생성  

## 📝 복원 가이드

### 환경 설정 파일 복원
1. `.env.example` 파일을 각 프로젝트에서 복사
2. `.env`로 이름 변경 후 실제 값으로 수정

### 데이터 파일 복원
- `foods.json`: 개발자가 별도 보관 중인 파일을 해당 위치에 배치
- `migrations/*.sql`: 개발자가 별도 보관 중인 스키마 파일들을 배치

## ⚠️ 주의사항

1. **절대 커밋하지 말 것**: 위 파일들은 민감한 정보를 포함하므로 Git에 커밋하면 안됩니다.
2. **로컬 백업**: 중요한 설정 파일들은 개인적으로 안전한 곳에 백업해두세요.
3. **팀 협업**: 새로운 팀원에게는 이 문서를 기반으로 필요한 파일들을 전달하세요.

## 📂 파일 구조 예시

```
PlayGround/
├── .env                          # 전역 환경 설정
├── moodbite/
│   └── MoodBite_BE/
│       └── src/main/resources/
│           ├── data.sql          # 포함됨 (개발용)
│           └── data/
│               └── foods.json    # 제외됨 (민감)
├── migrations/
│   ├── README.md                 # 포함됨 (문서)
│   ├── moodbite.sql             # 제외됨 (스키마)
│   ├── playground.sql           # 제외됨 (스키마)
│   └── trend.sql                # 제외됨 (스키마)
└── blog/blog_fe/
    └── .env.local               # 제외됨 (환경설정)
```