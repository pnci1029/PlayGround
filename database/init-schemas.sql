-- PlayGround 프로젝트 스키마 초기화 스크립트
-- 각 서비스별로 독립적인 스키마를 생성합니다.

-- 메인 서비스 스키마 (기본적으로 public 스키마 사용)
-- CREATE SCHEMA IF NOT EXISTS main; -- public 스키마를 그대로 사용

-- MoodBite 서비스 스키마
CREATE SCHEMA IF NOT EXISTS moodbite;
COMMENT ON SCHEMA moodbite IS 'MoodBite 서비스 전용 스키마';

-- Trend 서비스 스키마 (향후 필요시 사용)
CREATE SCHEMA IF NOT EXISTS trend;
COMMENT ON SCHEMA trend IS 'Trend 서비스 전용 스키마';

-- 각 스키마별 기본 권한 설정
GRANT USAGE ON SCHEMA moodbite TO postgres;
GRANT CREATE ON SCHEMA moodbite TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA moodbite TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA moodbite TO postgres;

GRANT USAGE ON SCHEMA trend TO postgres;
GRANT CREATE ON SCHEMA trend TO postgres;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA trend TO postgres;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA trend TO postgres;

-- 스키마 생성 완료 로그
SELECT 'Schema initialization completed' AS status;