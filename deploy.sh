#!/bin/bash

# 자동 배포 스크립트
set -e

echo "🚀 배포 시작..."

# 변경된 파일 확인 (최근 커밋과 비교)
BLOG_CHANGED=$(git diff --name-only HEAD~1 HEAD | grep "blog/" || true)
MOODBITE_CHANGED=$(git diff --name-only HEAD~1 HEAD | grep "moodbite/" || true)
PLAYGROUND_CHANGED=$(git diff --name-only HEAD~1 HEAD | grep "playground/" || true)
TREND_CHANGED=$(git diff --name-only HEAD~1 HEAD | grep "trend/" || true)
DOCKER_CHANGED=$(git diff --name-only HEAD~1 HEAD | grep -E "(docker-compose\.yml|\.env)" || true)

# 전체 재배포가 필요한 경우
if [[ -n "$DOCKER_CHANGED" ]]; then
    echo "🔄 Docker 설정 변경 감지 - 전체 재배포"
    docker compose down
    docker compose build --no-cache
    docker compose up -d
    echo "✅ 전체 재배포 완료"
    exit 0
fi

# 개별 서비스 재배포
if [[ -n "$BLOG_CHANGED" ]]; then
    echo "📝 블로그 변경 감지 - 블로그 재배포"
    docker compose build blog --no-cache
    docker compose up -d blog
    echo "✅ 블로그 재배포 완료"
fi

if [[ -n "$MOODBITE_CHANGED" ]]; then
    echo "🍎 MoodBite 변경 감지 - MoodBite 재배포"
    docker compose build moodbite --no-cache
    docker compose up -d moodbite
    echo "✅ MoodBite 재배포 완료"
fi

if [[ -n "$PLAYGROUND_CHANGED" ]]; then
    echo "🎮 Playground 변경 감지 - Playground 재배포"
    docker compose build backend --no-cache
    docker compose up -d backend
    echo "✅ Playground 재배포 완료"
fi

if [[ -n "$TREND_CHANGED" ]]; then
    echo "📈 Trend 변경 감지 - Trend 재배포"
    docker compose build trend --no-cache
    docker compose up -d trend
    echo "✅ Trend 재배포 완료"
fi

# 변경사항이 없는 경우
if [[ -z "$BLOG_CHANGED" && -z "$MOODBITE_CHANGED" && -z "$PLAYGROUND_CHANGED" && -z "$TREND_CHANGED" ]]; then
    echo "ℹ️  재배포할 변경사항이 없습니다"
fi

echo "🎉 배포 완료!"