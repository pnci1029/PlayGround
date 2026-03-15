FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치 (캐싱 최적화)
COPY package*.json ./
RUN npm ci --silent

# 소스 코드 복사
COPY . .

# 빌드 시 환경변수 설정
ARG NEXT_PUBLIC_API_URL=https://trend.chhong.kr/api
ARG NEXT_PUBLIC_WS_URL=wss://trend.chhong.kr/ws

ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}

# 빌드 (타입 체크 건너뛰기)
ENV NEXT_BUILD_SKIP_TYPE_CHECKS=true
RUN npm run build

# 포트 노출
EXPOSE 3000

# 실행
CMD ["npm", "start"]