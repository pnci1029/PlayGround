-- Trend 서비스 데이터베이스 스키마
-- 스키마: trend

-- 1. 트렌드 데이터 메인 테이블
CREATE TABLE IF NOT EXISTS trend.trends (
    id SERIAL PRIMARY KEY,
    keyword VARCHAR(500) NOT NULL,
    interest INTEGER NOT NULL DEFAULT 0,
    category VARCHAR(100) NOT NULL,
    source VARCHAR(50) NOT NULL CHECK (source IN ('hackernews', 'reddit', 'github', 'devto', 'rss')),
    region VARCHAR(100) NOT NULL DEFAULT 'Global',
    url TEXT,
    rank INTEGER,
    raw_data JSONB, -- 원본 API 응답 데이터 저장
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. 트렌드 히스토리 테이블 (시간대별 변화 추적)
CREATE TABLE IF NOT EXISTS trend.trend_history (
    id SERIAL PRIMARY KEY,
    trend_id INTEGER REFERENCES trend.trends(id) ON DELETE CASCADE,
    interest INTEGER NOT NULL,
    rank INTEGER,
    snapshot_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. 카테고리 정의 테이블
CREATE TABLE IF NOT EXISTS trend.categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    color VARCHAR(7), -- HEX 색상 코드
    icon VARCHAR(50), -- 아이콘 이름
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. 키워드 매핑 테이블 (자동 카테고리 분류용)
CREATE TABLE IF NOT EXISTS trend.keyword_mappings (
    id SERIAL PRIMARY KEY,
    keyword_pattern VARCHAR(200) NOT NULL,
    category_id INTEGER REFERENCES trend.categories(id),
    priority INTEGER DEFAULT 1, -- 우선순위 (낮을수록 높음)
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. 소스별 설정 테이블
CREATE TABLE IF NOT EXISTS trend.source_configs (
    id SERIAL PRIMARY KEY,
    source VARCHAR(50) UNIQUE NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    fetch_interval INTEGER DEFAULT 300, -- 초단위 (5분)
    max_items INTEGER DEFAULT 20,
    last_fetched TIMESTAMP WITH TIME ZONE,
    config_data JSONB, -- 소스별 추가 설정
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_trends_source ON trend.trends(source);
CREATE INDEX IF NOT EXISTS idx_trends_created_at ON trend.trends(created_at);
CREATE INDEX IF NOT EXISTS idx_trends_category ON trend.trends(category);
CREATE INDEX IF NOT EXISTS idx_trends_keyword ON trend.trends USING GIN(to_tsvector('english', keyword));
CREATE INDEX IF NOT EXISTS idx_trend_history_trend_id ON trend.trend_history(trend_id);
CREATE INDEX IF NOT EXISTS idx_trend_history_snapshot_at ON trend.trend_history(snapshot_at);

-- 7. 트리거 함수 (updated_at 자동 업데이트)
CREATE OR REPLACE FUNCTION trend.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 트리거 적용
DROP TRIGGER IF EXISTS update_trends_updated_at ON trend.trends;
CREATE TRIGGER update_trends_updated_at
    BEFORE UPDATE ON trend.trends
    FOR EACH ROW
    EXECUTE FUNCTION trend.update_updated_at_column();

DROP TRIGGER IF EXISTS update_source_configs_updated_at ON trend.source_configs;
CREATE TRIGGER update_source_configs_updated_at
    BEFORE UPDATE ON trend.source_configs
    FOR EACH ROW
    EXECUTE FUNCTION trend.update_updated_at_column();

-- 9. 기본 카테고리 데이터 삽입
INSERT INTO trend.categories (name, display_name, description, color, icon) VALUES
    ('tech', '기술', '기술 뉴스 및 개발 관련 트렌드', '#3b82f6', '💻'),
    ('programming', '프로그래밍', '프로그래밍 언어, 프레임워크, 도구', '#10b981', '⚡'),
    ('ai', 'AI/ML', '인공지능 및 머신러닝', '#8b5cf6', '🤖'),
    ('startup', '스타트업', '스타트업 및 비즈니스', '#f59e0b', '🚀'),
    ('security', '보안', '사이버 보안 및 프라이버시', '#ef4444', '🔒'),
    ('web', '웹 개발', '웹 개발 및 프론트엔드', '#06b6d4', '🌐'),
    ('mobile', '모바일', '모바일 앱 개발', '#ec4899', '📱'),
    ('devops', 'DevOps', '개발 운영 및 인프라', '#84cc16', '⚙️'),
    ('opensource', '오픈소스', '오픈소스 프로젝트', '#6366f1', '🔓'),
    ('gaming', '게임', '게임 개발 및 게임 업계', '#f97316', '🎮'),
    ('news', '뉴스', '일반 뉴스 및 시사', '#64748b', '📰'),
    ('other', '기타', '분류되지 않은 기타 트렌드', '#9ca3af', '📦')
ON CONFLICT (name) DO NOTHING;

-- 10. 기본 소스 설정 삽입
INSERT INTO trend.source_configs (source, is_enabled, fetch_interval, max_items, config_data) VALUES
    ('hackernews', true, 300, 15, '{"endpoint": "https://hacker-news.firebaseio.com/v0/topstories.json"}'),
    ('reddit', true, 300, 20, '{"subreddits": ["all", "popular", "programming"], "limit": 8}'),
    ('github', true, 3600, 12, '{"search_query": "created:>{date}", "sort": "stars", "order": "desc"}'),
    ('devto', true, 600, 12, '{"endpoint": "https://dev.to/api/articles", "top": 7}'),
    ('rss', true, 600, 16, '{"feeds": [{"url": "https://hnrss.org/frontpage", "source": "hackernews"}, {"url": "https://dev.to/feed", "source": "devto"}]}')
ON CONFLICT (source) DO NOTHING;

-- 11. 키워드 매핑 기본 데이터
INSERT INTO trend.keyword_mappings (keyword_pattern, category_id, priority) VALUES
    -- AI/ML 관련
    ('AI', (SELECT id FROM trend.categories WHERE name = 'ai'), 1),
    ('Machine Learning', (SELECT id FROM trend.categories WHERE name = 'ai'), 1),
    ('ChatGPT', (SELECT id FROM trend.categories WHERE name = 'ai'), 1),
    ('OpenAI', (SELECT id FROM trend.categories WHERE name = 'ai'), 1),
    ('neural', (SELECT id FROM trend.categories WHERE name = 'ai'), 2),
    
    -- 프로그래밍 언어
    ('JavaScript', (SELECT id FROM trend.categories WHERE name = 'programming'), 1),
    ('Python', (SELECT id FROM trend.categories WHERE name = 'programming'), 1),
    ('React', (SELECT id FROM trend.categories WHERE name = 'web'), 1),
    ('Node.js', (SELECT id FROM trend.categories WHERE name = 'web'), 1),
    ('TypeScript', (SELECT id FROM trend.categories WHERE name = 'programming'), 1),
    
    -- 보안 관련
    ('security', (SELECT id FROM trend.categories WHERE name = 'security'), 1),
    ('vulnerability', (SELECT id FROM trend.categories WHERE name = 'security'), 1),
    ('hack', (SELECT id FROM trend.categories WHERE name = 'security'), 2),
    
    -- DevOps
    ('Docker', (SELECT id FROM trend.categories WHERE name = 'devops'), 1),
    ('Kubernetes', (SELECT id FROM trend.categories WHERE name = 'devops'), 1),
    ('AWS', (SELECT id FROM trend.categories WHERE name = 'devops'), 1)
ON CONFLICT DO NOTHING;

-- 12. 데이터 정리용 함수 (30일 이상 된 히스토리 정리)
CREATE OR REPLACE FUNCTION trend.cleanup_old_history()
RETURNS void AS $$
BEGIN
    DELETE FROM trend.trend_history 
    WHERE snapshot_at < CURRENT_TIMESTAMP - INTERVAL '30 days';
    
    -- 더 이상 참조되지 않는 트렌드도 정리 (선택적)
    -- DELETE FROM trend.trends 
    -- WHERE created_at < CURRENT_TIMESTAMP - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- 스키마 생성 완료
SELECT 'Trend schema initialization completed' AS status;