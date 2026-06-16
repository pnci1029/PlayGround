"""
Database connection factory and schema initialisation.
"""
import psycopg2
import psycopg2.extras
from app.config import DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_SCHEMA


def get_db():
    print(f"🔗 Connecting to PostgreSQL: {DB_HOST}:{DB_PORT}/{DB_NAME} (schema: {DB_SCHEMA})")
    
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        cursor_factory=psycopg2.extras.RealDictCursor
    )
    return conn


def init_db() -> None:
    """
    데이터베이스 스키마와 테이블 초기화
    배포 환경에서 자동으로 필요한 구조를 생성
    """
    try:
        conn = get_db()
        with conn.cursor() as cur:
            print(f"Initializing database schema: {DB_SCHEMA}")
            
            # 1. 스키마 생성
            cur.execute(f"CREATE SCHEMA IF NOT EXISTS {DB_SCHEMA}")
            print(f"✓ Schema '{DB_SCHEMA}' created/verified")
            
            # 2. stocks 테이블 생성
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.stocks (
                    ticker      VARCHAR(20) NOT NULL,
                    market      VARCHAR(10) NOT NULL,
                    name        VARCHAR(255),
                    price       DECIMAL(15,4),
                    change_pct  DECIMAL(8,4),
                    volume      BIGINT,
                    market_cap  DECIMAL(20,2),
                    per         DECIMAL(10,4),
                    pbr         DECIMAL(10,4),
                    roe         DECIMAL(8,4),
                    eps         DECIMAL(10,4),
                    div_yield   DECIMAL(8,4),
                    week52_high DECIMAL(15,4),
                    week52_low  DECIMAL(15,4),
                    debt_ratio   DECIMAL(12,4),
                    eps_growth   DECIMAL(12,4),
                    sales_growth DECIMAL(12,4),
                    updated_at  TIMESTAMP,
                    PRIMARY KEY (ticker, market)
                )
            """)
            print(f"✓ Table '{DB_SCHEMA}.stocks' created/verified")

            # 2b. 신규 컬럼 자동 마이그레이션.
            # CREATE TABLE IF NOT EXISTS는 기존 테이블에 컬럼을 추가하지 않으므로,
            # 이미 떠 있는 DB에도 반영되도록 ADD COLUMN IF NOT EXISTS를 멱등 실행한다.
            for col, ddl in (
                ("debt_ratio",   "DECIMAL(12,4)"),
                ("eps_growth",   "DECIMAL(12,4)"),
                ("sales_growth", "DECIMAL(12,4)"),
            ):
                cur.execute(
                    f"ALTER TABLE {DB_SCHEMA}.stocks ADD COLUMN IF NOT EXISTS {col} {ddl}"
                )
            print(f"✓ Table '{DB_SCHEMA}.stocks' columns migrated")
            
            # 3. last_refresh 테이블 생성
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.last_refresh (
                    id          SERIAL PRIMARY KEY,
                    market      VARCHAR(10),
                    finished_at TIMESTAMP
                )
            """)
            print(f"✓ Table '{DB_SCHEMA}.last_refresh' created/verified")
            
            # 4. watchlists 테이블 생성
            cur.execute(f"""
                CREATE TABLE IF NOT EXISTS {DB_SCHEMA}.watchlists (
                    id         SERIAL PRIMARY KEY,
                    name       VARCHAR(255) NOT NULL,
                    tickers    TEXT NOT NULL DEFAULT '[]',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            print(f"✓ Table '{DB_SCHEMA}.watchlists' created/verified")
            
            # 5. 테이블 존재 확인
            cur.execute(f"SELECT 1 FROM {DB_SCHEMA}.stocks LIMIT 1")
            
        conn.commit()
        conn.close()
        print("✓ Database initialization completed successfully")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        raise e
