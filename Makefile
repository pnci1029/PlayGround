.PHONY: build up down restart rebuild

# 이미지 빌드
build:
	@echo "Building images..."
	docker build -t playground-frontend:latest ./playground/fe
	docker build -t playground-backend:latest ./playground/be
	@echo "Build complete!"

# 서비스 시작
up:
	@echo "Starting services..."
	docker-compose up -d
	@echo "Services started!"

# 서비스 중지
down:
	@echo "Stopping services..."
	docker-compose down
	@echo "Services stopped!"

# 서비스 재시작
restart:
	@echo "Restarting services..."
	docker-compose restart
	@echo "Services restarted!"

# 빌드 + 시작 (docker-compose up -d --build 대체)
rebuild:
	@echo "Rebuilding and starting services..."
	make down
	make build
	make up
	@echo "Rebuild complete!"

# 상태 확인
status:
	@echo "Service status:"
	docker-compose ps

# 로그 확인
logs:
	docker-compose logs -f

# 프론트엔드만 빌드
build-fe:
	docker build -t playground-frontend:latest ./playground/fe

# 백엔드만 빌드  
build-be:
	docker build -t playground-backend:latest ./playground/be