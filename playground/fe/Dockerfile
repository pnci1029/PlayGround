FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --silent

# 소스 코드 복사
COPY . .

# 빌드
RUN npm run build

# standalone 파일 복사
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public

# 포트 노출
EXPOSE 3000

# 실행
CMD ["node", "server.js"]