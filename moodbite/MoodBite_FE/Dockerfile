# React 프론트엔드 Dockerfile
FROM node:18-alpine AS build

WORKDIR /app

# package.json과 package-lock.json 복사 (의존성 캐싱을 위해)
COPY package.json package-lock.json* ./

# 의존성 설치 (legacy peer deps와 force 옵션 사용)
RUN npm install --legacy-peer-deps

# 소스 코드 복사
COPY . .

# 프로덕션 빌드 (--force 옵션으로 의존성 충돌 무시)
RUN npm run build || (npm install --force && npm run build)

# Nginx로 프로덕션 서빙
FROM nginx:alpine

# 빌드된 파일을 nginx에 복사
COPY --from=build /app/build /usr/share/nginx/html

# 커스텀 nginx 설정 (SPA 라우팅을 위한 fallback 설정)
COPY <<EOF /etc/nginx/conf.d/default.conf
server {
    listen 3000;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files \$uri \$uri/ /index.html;
    }
}
EOF

# 포트 노출
EXPOSE 3000

# Nginx 실행
CMD ["nginx", "-g", "daemon off;"]