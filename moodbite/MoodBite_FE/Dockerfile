# React 프론트엔드 Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# package.json과 package-lock.json 복사 (의존성 캐싱을 위해)
COPY package.json package-lock.json* ./

# 캐시 정리 및 의존성 설치
RUN npm cache clean --force
RUN npm install --legacy-peer-deps --no-audit --no-fund || npm install --force --no-audit --no-fund

# 소스 코드 복사
COPY . .

# 프로덕션 빌드 (모든 경고 무시)
ENV CI=false
ENV GENERATE_SOURCEMAP=false
ENV DISABLE_ESLINT_PLUGIN=true
RUN npm run build || (rm -rf node_modules package-lock.json && npm install --force --no-audit --no-fund && npm run build)

# Nginx로 프로덕션 서빙
FROM nginx:alpine

# 빌드된 파일을 nginx에 복사
COPY --from=builder /app/build /usr/share/nginx/html

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