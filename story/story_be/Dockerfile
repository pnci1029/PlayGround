FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . ./

# 프로덕션 빌드 (TypeScript -> dist/)
RUN npm run build

# 포트 노출 (WebSocket 없음 — SSE/HTTP만)
EXPOSE 8004

# 프로덕션 서버 실행
CMD ["npm", "start"]
