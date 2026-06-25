#!/bin/bash

# 분리된 배포 스크립트
set -e

echo "🚀 분리된 배포 시작..."

# GitHub Actions에서 전달받은 환경변수
BLOG_CHANGED=${BLOG_CHANGED:-"false"}
MOODBITE_CHANGED=${MOODBITE_CHANGED:-"false"}
PLAYGROUND_CHANGED=${PLAYGROUND_CHANGED:-"false"}
TREND_CHANGED=${TREND_CHANGED:-"false"}
STOCK_SCREENER_CHANGED=${STOCK_SCREENER_CHANGED:-"false"}
STORY_CHANGED=${STORY_CHANGED:-"false"}
DOCKER_CHANGED=${DOCKER_CHANGED:-"false"}
CADDY_CHANGED=${CADDY_CHANGED:-"false"}
DB_CONFIG_CHANGED=${DB_CONFIG_CHANGED:-"false"}

# DB 및 공용 서비스가 실행 중인지 확인
echo "🔍 DB 상태 확인..."
if ! docker ps | grep -q postgres; then
    echo "📦 DB 및 공용 서비스 시작..."
    docker compose -f docker-compose.db.yml up -d
    echo "⏳ DB 준비 대기..."
    sleep 10
else
    echo "✅ DB 서비스 이미 실행 중"

    # ── postgres 포트 바인딩 변경 적용 (안전 가드) ──────────────────────────
    # 포트 바인딩(0.0.0.0 → 127.0.0.1 등)은 컨테이너 recreate 가 있어야만 바뀐다.
    # 평소 배포는 일부러 DB 를 건드리지 않으므로, 'docker-compose.db.yml 이 실제로
    # 바뀐 경우(DB_CONFIG_CHANGED=true)'에만 점검한다. 그리고 recreate 는 짧은
    # 다운타임이 있으니, 현재 바인딩이 이미 원하는 값이면 건너뛴다(=idempotent).
    # → 포트가 바뀐 그 한 번만 재생성되고, 이후 배포에선 DB 를 건드리지 않는다.
    # (데이터는 named volume `postgres_data` 에 유지되므로 손실 없음)
    if [[ "$DB_CONFIG_CHANGED" == "true" ]]; then
        echo "🔍 DB compose 변경 감지 - postgres 포트 바인딩 점검..."
        DESIRED_BIND="127.0.0.1"
        CURRENT_BIND=$(docker inspect postgres \
            --format '{{range $p, $conf := .HostConfig.PortBindings}}{{range $conf}}{{.HostIp}} {{end}}{{end}}' \
            2>/dev/null || echo "")
        if echo "$CURRENT_BIND" | grep -q "$DESIRED_BIND"; then
            echo "✅ postgres 이미 ${DESIRED_BIND} 바인딩 - recreate 불필요"
        else
            echo "🔄 postgres 바인딩 변경 적용 - 컨테이너 recreate (데이터는 볼륨 유지)..."
            docker compose -f docker-compose.db.yml --env-file .env up -d --force-recreate postgres
            echo "⏳ postgres 준비 대기..."
            for i in $(seq 1 15); do
                if docker exec postgres pg_isready -U postgres >/dev/null 2>&1; then
                    echo "✅ postgres 준비 완료"
                    break
                fi
                sleep 2
            done
        fi
    fi
fi

# Caddy가 실행 중인지 확인
if ! docker ps | grep -q caddy; then
    echo "📦 Caddy 시작..."
    docker compose -f docker-compose.db.yml up -d caddy
else
    echo "✅ Caddy 서비스 이미 실행 중"
    if [[ "$CADDY_CHANGED" == "true" ]]; then
        echo "🔄 Caddy 설정 변경 감지 - 컨테이너 재생성..."
        # Caddyfile 은 단일 파일 바인드마운트(./caddy/Caddyfile:/etc/caddy/Caddyfile)라,
        # 배포 시 tar 가 파일을 통째로 교체하면 inode 가 바뀌어 컨테이너는 옛 파일(옛 inode)을
        # 계속 본다. 그래서 `caddy reload` 는 "config is unchanged" 만 찍고 새 설정이 안 먹는다.
        # 마운트를 현재 호스트 파일로 다시 묶으려면 컨테이너를 recreate 해야 한다.
        # (인증서는 caddy_data 볼륨에 남아 재발급 없이 유지됨)
        docker compose -f docker-compose.db.yml up -d --force-recreate caddy
        echo "✅ Caddy 재생성 완료"
    fi
fi

# 네트워크 생성 확인
docker network create playground_playground_network 2>/dev/null || echo "네트워크 이미 존재"

# 개별 서비스 배포
if [[ "$BLOG_CHANGED" == "true" ]]; then
    echo "📝 블로그 변경 감지 - 블로그 재배포"
    if [[ ! -f "blog/docker-compose.yml" ]]; then
        echo "❌ blog/docker-compose.yml 파일이 없습니다!"
        exit 1
    fi
    cd blog
    # ${POSTGRES_PASSWORD} 보간은 compose 디렉터리의 .env 나 쉘에서만 읽힌다.
    # 비밀번호는 루트 .env 에 있으므로 --env-file 로 그 파일을 보간 소스로 명시한다.
    # (이게 없으면 DB_PASSWORD 가 빈 값이 되어 컨테이너가 DB 인증 실패로 죽는다)
    COMPOSE_ENV="--env-file ../.env"
    docker compose $COMPOSE_ENV -p blog_service build
    # 고정 container_name(blog)이 다른 compose 프로젝트로 떠 있으면
    # 이름 충돌로 up이 실패한다. 같은 프로젝트면 down, 아니면 이름으로 강제 제거.
    docker compose $COMPOSE_ENV -p blog_service down --remove-orphans 2>/dev/null || true
    docker rm -f blog 2>/dev/null || true
    docker compose $COMPOSE_ENV -p blog_service up -d --force-recreate
    cd ..
    echo "✅ 블로그 재배포 완료"
fi

if [[ "$MOODBITE_CHANGED" == "true" ]]; then
    echo "🍎 MoodBite 변경 감지 - MoodBite 재배포"
    cd moodbite
    # ${POSTGRES_PASSWORD} 보간은 compose 디렉터리(여기 moodbite/)의 .env 나 쉘에서만 읽힌다.
    # 비밀번호는 루트 .env 에 있으므로 --env-file 로 그 파일을 보간 소스로 명시한다.
    # (이게 없으면 DB_PASSWORD 가 빈 값이 되어 컨테이너가 DB 인증 실패로 죽는다)
    COMPOSE_ENV="--env-file ../.env"
    docker compose $COMPOSE_ENV -p moodbite_service build
    # 고정 container_name(moodbite)이 다른 compose 프로젝트로 떠 있으면
    # 이름 충돌로 up이 실패한다. 같은 프로젝트면 down, 아니면 이름으로 강제 제거.
    docker compose $COMPOSE_ENV -p moodbite_service down --remove-orphans 2>/dev/null || true
    docker rm -f moodbite 2>/dev/null || true
    docker compose $COMPOSE_ENV -p moodbite_service up -d --force-recreate
    cd ..
    echo "✅ MoodBite 재배포 완료"
fi

if [[ "$PLAYGROUND_CHANGED" == "true" ]]; then
    echo "🎮 Playground 변경 감지 - Playground 재배포"
    cd playground
    # ${POSTGRES_PASSWORD} 보간은 compose 디렉터리의 .env 나 쉘에서만 읽힌다.
    # 비밀번호는 루트 .env 에 있으므로 --env-file 로 그 파일을 보간 소스로 명시한다.
    # (이게 없으면 DB_PASSWORD 가 빈 값이 되어 컨테이너가 DB 인증 실패로 죽는다)
    COMPOSE_ENV="--env-file ../.env"
    docker compose $COMPOSE_ENV -p playground_service build
    # 고정 container_name(playground)이 다른 compose 프로젝트로 떠 있으면
    # 이름 충돌로 up이 실패한다. 같은 프로젝트면 down, 아니면 이름으로 강제 제거.
    docker compose $COMPOSE_ENV -p playground_service down --remove-orphans 2>/dev/null || true
    docker rm -f playground 2>/dev/null || true
    docker compose $COMPOSE_ENV -p playground_service up -d --force-recreate
    cd ..
    echo "✅ Playground 재배포 완료"
fi

if [[ "$TREND_CHANGED" == "true" ]]; then
    echo "📈 Trend 변경 감지 - Trend 재배포"
    cd trend
    # ${POSTGRES_PASSWORD} 보간은 compose 디렉터리의 .env 나 쉘에서만 읽힌다.
    # 비밀번호는 루트 .env 에 있으므로 --env-file 로 그 파일을 보간 소스로 명시한다.
    # (이게 없으면 DB_PASSWORD 가 빈 값이 되어 컨테이너가 DB 인증 실패로 죽는다)
    COMPOSE_ENV="--env-file ../.env"
    docker compose $COMPOSE_ENV -p trend_service build
    # 고정 container_name(trend)이 다른 compose 프로젝트로 떠 있으면
    # 이름 충돌로 up이 실패한다. 같은 프로젝트면 down, 아니면 이름으로 강제 제거.
    docker compose $COMPOSE_ENV -p trend_service down --remove-orphans 2>/dev/null || true
    docker rm -f trend 2>/dev/null || true
    docker compose $COMPOSE_ENV -p trend_service up -d --force-recreate
    cd ..
    echo "✅ Trend 재배포 완료"
fi

if [[ "$STOCK_SCREENER_CHANGED" == "true" ]]; then
    echo "📊 Stock Screener 변경 감지 - Stock Screener 재배포"
    cd stock_screener
    # ${POSTGRES_PASSWORD} 보간은 compose 디렉터리의 .env 나 쉘에서만 읽힌다.
    # 비밀번호는 루트 .env 에 있으므로 --env-file 로 그 파일을 보간 소스로 명시한다.
    # (이게 없으면 DB_PASSWORD 가 빈 값이 되어 컨테이너가 DB 인증 실패로 죽는다)
    COMPOSE_ENV="--env-file ../.env"
    docker compose $COMPOSE_ENV -p stock_screener_service build
    # 고정 container_name(stock_screener)이 다른 compose 프로젝트로 떠 있으면
    # 이름 충돌로 up이 실패한다. 같은 프로젝트면 down, 아니면 이름으로 강제 제거.
    docker compose $COMPOSE_ENV -p stock_screener_service down --remove-orphans 2>/dev/null || true
    docker rm -f stock_screener 2>/dev/null || true
    docker compose $COMPOSE_ENV -p stock_screener_service up -d --force-recreate
    cd ..
    echo "✅ Stock Screener 재배포 완료"
fi

if [[ "$STORY_CHANGED" == "true" ]]; then
    echo "📖 Story 변경 감지 - Story 재배포"
    cd story
    # ${POSTGRES_PASSWORD} 보간은 compose 디렉터리의 .env 나 쉘에서만 읽힌다.
    # 비밀번호는 루트 .env 에 있으므로 --env-file 로 그 파일을 보간 소스로 명시한다.
    COMPOSE_ENV="--env-file ../.env"
    docker compose $COMPOSE_ENV -p story_service build
    # 고정 container_name(story)이 다른 compose 프로젝트로 떠 있으면 이름 충돌 → 강제 제거.
    docker compose $COMPOSE_ENV -p story_service down --remove-orphans 2>/dev/null || true
    docker rm -f story 2>/dev/null || true
    docker compose $COMPOSE_ENV -p story_service up -d --force-recreate
    cd ..
    echo "✅ Story 재배포 완료"
fi

# Docker 설정 전체 변경 시 모든 백엔드 재배포 (DB 제외)
if [[ "$DOCKER_CHANGED" == "true" ]]; then
    echo "🔄 Docker 설정 변경 감지 - 모든 백엔드 서비스 재배포"

    # 각 프로젝트별로 재배포
    # (개별 서비스 블록과 동일하게: 루트 .env 를 보간 소스로 명시하고,
    #  다른 compose 프로젝트가 점유한 고정 container_name 을 이름으로 강제 제거한다.
    #  모든 서비스는 dir 이름 == container_name 이라 docker rm -f $project 로 충분)
    # trend 제외: trend Dockerfile의 COPY ../../migrations 가 빌드 컨텍스트 밖이라
    # 빌드 실패 → set -e 로 전체 배포가 멈춤. trend는 현재 배포 대상 아님.
    for project in playground moodbite blog stock_screener story; do
        if [ -d "$project" ] && [ -f "$project/docker-compose.yml" ]; then
            echo "🔄 $project 재배포 중..."
            cd $project
            COMPOSE_ENV="--env-file ../.env"
            docker compose $COMPOSE_ENV -p ${project}_service down --remove-orphans 2>/dev/null || true
            docker rm -f $project 2>/dev/null || true
            docker compose $COMPOSE_ENV -p ${project}_service build
            docker compose $COMPOSE_ENV -p ${project}_service up -d --force-recreate
            cd ..
        fi
    done

    echo "✅ 모든 백엔드 서비스 재배포 완료 (DB 유지)"
    exit 0
fi

# 변경사항이 없는 경우
if [[ "$BLOG_CHANGED" == "false" && "$MOODBITE_CHANGED" == "false" && "$PLAYGROUND_CHANGED" == "false" && "$TREND_CHANGED" == "false" && "$STOCK_SCREENER_CHANGED" == "false" && "$STORY_CHANGED" == "false" ]]; then
    echo "ℹ️  재배포할 변경사항이 없습니다"
fi

echo "🎉 배포 완료!"
