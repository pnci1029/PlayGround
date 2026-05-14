#!/bin/bash

# 전체 시스템 테스트 스크립트
set -e

echo "🧪 전체 시스템 테스트 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

success_count=0
fail_count=0

test_passed() {
    echo -e "${GREEN}✅ $1${NC}"
    ((success_count++))
}

test_failed() {
    echo -e "${RED}❌ $1${NC}"
    ((fail_count++))
}

test_warning() {
    echo -e "${YELLOW}⚠️ $1${NC}"
}

# 1. 로컬 빌드 테스트
echo "📦 1. 로컬 빌드 테스트..."

# 블로그 프론트엔드 빌드
echo "   - 블로그 프론트엔드 빌드 중..."
if cd blog/blog_fe && npm run build > /tmp/blog-build.log 2>&1; then
    test_passed "블로그 프론트엔드 빌드 성공"
else
    test_failed "블로그 프론트엔드 빌드 실패"
    echo "로그: $(tail -5 /tmp/blog-build.log)"
fi
cd ../..

# 블로그 백엔드 타입체크
echo "   - 블로그 백엔드 타입체크 중..."
if cd blog/blog_be && npm run type-check > /tmp/blog-typecheck.log 2>&1; then
    test_passed "블로그 백엔드 타입체크 성공"
else
    test_failed "블로그 백엔드 타입체크 실패"
    echo "로그: $(tail -5 /tmp/blog-typecheck.log)"
fi
cd ../..

# 2. 서버 연결 테스트
echo "📡 2. 서버 연결 테스트..."
if ssh contabo "echo 'SSH 연결 성공'" > /dev/null 2>&1; then
    test_passed "서버 SSH 연결 성공"
else
    test_failed "서버 SSH 연결 실패"
fi

# 3. 서버 상태 확인
echo "🐳 3. 서버 컨테이너 상태 확인..."

# 필수 컨테이너 확인
required_containers=("postgres" "blog" "caddy")
for container in "${required_containers[@]}"; do
    if ssh contabo "docker ps | grep $container" > /dev/null 2>&1; then
        test_passed "$container 컨테이너 실행 중"
    else
        test_failed "$container 컨테이너 실행되지 않음"
    fi
done

# PostgreSQL 헬스체크
if ssh contabo "docker exec postgres pg_isready -U postgres" > /dev/null 2>&1; then
    test_passed "PostgreSQL 헬스체크 성공"
else
    test_failed "PostgreSQL 헬스체크 실패"
fi

# 4. API 엔드포인트 테스트
echo "🔌 4. API 엔드포인트 테스트..."

# 블로그 API 헬스체크
if ssh contabo "curl -s -f http://localhost:8003/health" > /dev/null 2>&1; then
    test_passed "블로그 API 헬스체크 성공"
else
    test_failed "블로그 API 헬스체크 실패"
fi

# 블로그 포스트 API
if ssh contabo "curl -s -f http://localhost:8003/api/posts" > /dev/null 2>&1; then
    test_passed "블로그 포스트 API 응답 성공"
else
    test_failed "블로그 포스트 API 응답 실패"
fi

# 새로운 사용자 API (404가 아니면 성공)
api_response=$(ssh contabo "curl -s -o /dev/null -w '%{http_code}' http://localhost:8003/api/users")
if [[ "$api_response" != "404" ]]; then
    test_passed "블로그 사용자 API 엔드포인트 존재"
else
    test_failed "블로그 사용자 API 엔드포인트 404 에러"
fi

# 5. 외부 도메인 테스트
echo "🌐 5. 외부 도메인 테스트..."

# 블로그 API 도메인
if curl -s -f https://blog-api.chhong.kr/health > /dev/null 2>&1; then
    test_passed "블로그 API 도메인 응답 성공"
else
    test_failed "블로그 API 도메인 응답 실패"
fi

# 블로그 프론트엔드 도메인 (Vercel)
blog_status=$(curl -s -o /dev/null -w '%{http_code}' https://blog.chhong.kr)
if [[ "$blog_status" == "200" ]]; then
    test_passed "블로그 프론트엔드 도메인 응답 성공"
else
    test_warning "블로그 프론트엔드 도메인 응답: HTTP $blog_status"
fi

# 6. Git 상태 확인
echo "📝 6. Git 상태 확인..."

if git status --porcelain | grep -q .; then
    test_warning "커밋되지 않은 변경사항 존재"
    git status --porcelain
else
    test_passed "Git 작업 디렉토리 깨끗함"
fi

# 7. 배포 스크립트 문법 검사
echo "🚀 7. 배포 스크립트 검사..."

if bash -n deploy.sh; then
    test_passed "배포 스크립트 문법 올바름"
else
    test_failed "배포 스크립트 문법 오류"
fi

# 결과 요약
echo ""
echo "📊 테스트 결과 요약:"
echo "✅ 성공: $success_count"
echo "❌ 실패: $fail_count"

if [[ $fail_count -eq 0 ]]; then
    echo -e "${GREEN}🎉 모든 테스트 통과! 배포 준비 완료${NC}"
    exit 0
else
    echo -e "${RED}💥 $fail_count개 테스트 실패. 문제 해결 후 다시 시도하세요.${NC}"
    exit 1
fi