FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --silent

# 소스 코드 복사
COPY src ./src
COPY tsconfig.json ./

# migrations 는 빌드 컨텍스트(./trend_be) 밖이라 COPY 불가 → 빌드 실패함.
# 런타임에 compose 볼륨으로 /app/migrations 마운트해서 trend.sql 을 제공한다.
# COPY ../../migrations ./migrations

# TypeScript 빌드
RUN npm run build

# 포트 노출
EXPOSE 8002 8012

# 프로덕션 실행
CMD ["npm", "start"]
