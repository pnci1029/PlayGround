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
DOCKER_CHANGED=${DOCKER_CHANGED:-"false"}
CADDY_CHANGED=${CADDY_CHANGED:-"false"}

# DB 및 공용 서비스가 실행 중인지 확인
echo "🔍 DB 상태 확인..."
if ! docker ps | grep -q postgres; then
    echo "📦 DB 및 공용 서비스 시작..."
    docker compose -f docker-compose.db.yml up -d
    echo "⏳ DB 준비 대기..."
    sleep 10
else
    echo "✅ DB 서비스 이미 실행 중"
fi

# Caddy가 실행 중인지 확인
if ! docker ps | grep -q caddy; then
    echo "📦 Caddy 시작..."
    docker compose -f docker-compose.db.yml up -d caddy
else
    echo "✅ Caddy 서비스 이미 실행 중"
    if [[ "$CADDY_CHANGED" == "true" ]]; then
        echo "🔄 Caddy 설정 변경 감지 - 리로드..."
        docker exec caddy caddy reload --config /etc/caddy/Caddyfile
        echo "✅ Caddy 리로드 완료"
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
    docker compose -p blog_service build
    docker compose -p blog_service up -d --force-recreate
    cd ..
    echo "✅ 블로그 재배포 완료"
fi

if [[ "$MOODBITE_CHANGED" == "true" ]]; then
    echo "🍎 MoodBite 변경 감지 - MoodBite 재배포"
    cd moodbite
    docker compose -p moodbite_service build
    docker compose -p moodbite_service up -d --force-recreate
    cd ..
    echo "✅ MoodBite 재배포 완료"
fi

if [[ "$PLAYGROUND_CHANGED" == "true" ]]; then
    echo "🎮 Playground 변경 감지 - Playground 재배포"
    cd playground
    docker compose -p playground_service build
    docker compose -p playground_service up -d --force-recreate
    cd ..
    echo "✅ Playground 재배포 완료"
fi

if [[ "$TREND_CHANGED" == "true" ]]; then
    echo "📈 Trend 변경 감지 - Trend 재배포"
    cd trend
    docker compose -p trend_service build
    docker compose -p trend_service up -d --force-recreate
    cd ..
    echo "✅ Trend 재배포 완료"
fi

# if [[ "$STOCK_SCREENER_CHANGED" == "true" ]]; then
#     echo "📊 Stock Screener 변경 감지 - Stock Screener 재배포"
#     cd stock_screener
#     docker compose -p stock_screener_service build
#     docker compose -p stock_screener_service up -d --force-recreate
#     cd ..
#     echo "✅ Stock Screener 재배포 완료"
# fi

# Docker 설정 전체 변경 시 모든 백엔드 재배포 (DB 제외)
if [[ "$DOCKER_CHANGED" == "true" ]]; then
    echo "🔄 Docker 설정 변경 감지 - 모든 백엔드 서비스 재배포"

    # 각 프로젝트별로 재배포
    for project in playground moodbite trend blog stock_screener; do
        if [ -d "$project" ] && [ -f "$project/docker-compose.yml" ]; then
            echo "🔄 $project 재배포 중..."
            cd $project
            docker compose -p ${project}_service down
            docker compose -p ${project}_service build
            docker compose -p ${project}_service up -d
            cd ..
        fi
    done

    echo "✅ 모든 백엔드 서비스 재배포 완료 (DB 유지)"
    exit 0
fi

# 변경사항이 없는 경우
if [[ "$BLOG_CHANGED" == "false" && "$MOODBITE_CHANGED" == "false" && "$PLAYGROUND_CHANGED" == "false" && "$TREND_CHANGED" == "false" && "$STOCK_SCREENER_CHANGED" == "false" ]]; then
    echo "ℹ️  재배포할 변경사항이 없습니다"
fi

echo "🎉 배포 완료!"
