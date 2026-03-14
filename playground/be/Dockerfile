FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY playground/be/package*.json ./
RUN npm ci --silent

# 소스 코드 복사
COPY playground/be/ .

# migrations 디렉토리 복사
COPY migrations /app/migrations

# 포트 노출
EXPOSE 8000

# 개발 서버 실행
CMD ["npm", "run", "dev"]