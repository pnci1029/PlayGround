#!/bin/bash

# 자동 배포 스크립트
set -e

echo "🚀 배포 시작..."

# GitHub Actions에서 전달받은 환경변수로 변경 감지
BLOG_CHANGED=${BLOG_CHANGED:-"false"}
MOODBITE_CHANGED=${MOODBITE_CHANGED:-"false"}
PLAYGROUND_CHANGED=${PLAYGROUND_CHANGED:-"false"}
TREND_CHANGED=${TREND_CHANGED:-"false"}
STOCK_SCREENER_CHANGED=${STOCK_SCREENER_CHANGED:-"false"}
DOCKER_CHANGED=${DOCKER_CHANGED:-"false"}

# 전체 재배포가 필요한 경우 (PostgreSQL 제외)
if [[ "$DOCKER_CHANGED" == "true" ]]; then
    echo "🔄 Docker 설정 변경 감지 - 백엔드 서비스 재배포"
    docker compose stop backend moodbite trend blog stock_screener
    docker compose build --no-cache backend moodbite trend blog stock_screener
    docker compose up -d backend moodbite trend blog stock_screener
    echo "✅ 백엔드 서비스 재배포 완료 (PostgreSQL 유지)"
    exit 0
fi

# 개별 서비스 재배포
if [[ "$BLOG_CHANGED" == "true" ]]; then
    echo "📝 블로그 변경 감지 - 블로그 재배포"
    docker compose build blog --no-cache
    docker compose up -d blog
    echo "✅ 블로그 재배포 완료"
fi

if [[ "$MOODBITE_CHANGED" == "true" ]]; then
    echo "🍎 MoodBite 변경 감지 - MoodBite 재배포"
    docker compose build moodbite --no-cache
    docker compose up -d moodbite
    echo "✅ MoodBite 재배포 완료"
fi

if [[ "$PLAYGROUND_CHANGED" == "true" ]]; then
    echo "🎮 Playground 변경 감지 - Playground 재배포"
    docker compose build backend --no-cache
    docker compose up -d backend
    echo "✅ Playground 재배포 완료"
fi

if [[ "$TREND_CHANGED" == "true" ]]; then
    echo "📈 Trend 변경 감지 - Trend 재배포"
    docker compose build trend --no-cache
    docker compose up -d trend
    echo "✅ Trend 재배포 완료"
fi

if [[ "$STOCK_SCREENER_CHANGED" == "true" ]]; then
    echo "📊 Stock Screener 변경 감지 - Stock Screener 재배포"
    docker compose build stock_screener --no-cache
    docker compose up -d stock_screener
    echo "✅ Stock Screener 재배포 완료"
fi

# 변경사항이 없는 경우
if [[ "$BLOG_CHANGED" == "false" && "$MOODBITE_CHANGED" == "false" && "$PLAYGROUND_CHANGED" == "false" && "$TREND_CHANGED" == "false" && "$STOCK_SCREENER_CHANGED" == "false" ]]; then
    echo "ℹ️  재배포할 변경사항이 없습니다"
fi

echo "🎉 배포 완료!"