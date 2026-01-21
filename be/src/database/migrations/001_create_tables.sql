-- ================================================
-- 기본 테이블 생성
-- ================================================

-- 사용자 테이블
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 도구 사용 로그 테이블 (선택사항)
CREATE TABLE IF NOT EXISTS tool_usage_logs (
  id SERIAL PRIMARY KEY,
  tool_name VARCHAR(50) NOT NULL,
  user_ip VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ================================================
-- 인덱스 생성
-- ================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_tool_logs_tool_name ON tool_usage_logs(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_logs_created_at ON tool_usage_logs(created_at);