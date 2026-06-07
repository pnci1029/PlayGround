FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --silent

# 소스 코드 복사
COPY . .

# migrations 디렉토리 복사 (상위 디렉토리에서)
# 빌드 컨텍스트가 ./be 라 ../../migrations 가 컨텍스트 밖이라 빌드 실패함.
# 게다가 src/index.ts 의 MigrationService import 가 주석 처리돼 실제로 안 쓰임. 그래서 비활성화.
# COPY ../../migrations ./migrations

# 포트 노출
EXPOSE 8000 8010

# 개발 서버 실행
CMD ["npm", "run", "dev"]