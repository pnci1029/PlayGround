FROM node:20-alpine

WORKDIR /app

# 패키지 파일 복사 및 의존성 설치
COPY package*.json ./
RUN npm install

# 소스 코드 복사
COPY . .

# 포트 노출 (실제 개발 서버 포트와 맞춤)
EXPOSE 3003

# 개발 서버 실행
CMD ["npm", "run", "dev"]