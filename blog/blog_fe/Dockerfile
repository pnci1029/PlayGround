FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화 + 재시도)
COPY package*.json ./
RUN npm ci --silent || npm ci --registry https://registry.npmmirror.com --silent || npm install

# 소스 코드 복사
COPY . .

# 포트 노출
EXPOSE 3003

# 개발 서버 실행
CMD ["npm", "run", "dev"]