# React 프론트엔드 Dockerfile
FROM node:20-alpine AS build

WORKDIR /app

# 패키지 파일 복사 (캐싱 최적화)
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent

# 소스 코드 복사 및 빌드
COPY . .

# 빌드 시점에 환경변수 설정
ARG REACT_APP_API_URL=https://moodbite.chhong.kr
ARG REACT_APP_WS_URL=wss://moodbite.chhong.kr/ws
ENV REACT_APP_API_URL=${REACT_APP_API_URL}
ENV REACT_APP_WS_URL=${REACT_APP_WS_URL}

RUN npm run build

# Nginx 서빙
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html

# Nginx 설정
RUN echo 'server { \
    listen 3000; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]