FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --silent

# 소스 코드 복사
COPY . .

# TypeScript 빌드
RUN npm run build

# 포트 노출
EXPOSE 8002 8012

# 프로덕션 실행
CMD ["npm", "start"]
