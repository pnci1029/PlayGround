-- 스키마 생성
CREATE SCHEMA IF NOT EXISTS moodbite;
CREATE SCHEMA IF NOT EXISTS trend;
CREATE SCHEMA IF NOT EXISTS blog;
CREATE SCHEMA IF NOT EXISTS playground;
CREATE SCHEMA IF NOT EXISTS stocks;
CREATE SCHEMA IF NOT EXISTS story;

-- 기본 권한 설정
GRANT ALL PRIVILEGES ON SCHEMA moodbite TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA trend TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA blog TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA playground TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA stocks TO postgres;
GRANT ALL PRIVILEGES ON SCHEMA story TO postgres;

-- Stocks 스키마 테이블 생성
CREATE TABLE IF NOT EXISTS stocks.stocks (
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
    updated_at  TIMESTAMP,
    PRIMARY KEY (ticker, market)
);

CREATE TABLE IF NOT EXISTS stocks.last_refresh (
    id          SERIAL PRIMARY KEY,
    market      VARCHAR(10),
    finished_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS stocks.watchlists (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(255) NOT NULL,
    tickers    TEXT NOT NULL DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);