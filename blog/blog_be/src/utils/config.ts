import 'dotenv/config';

// JWT_SECRET 은 보안상 필수. 폴백 기본값을 두면 토큰 위조가 가능하므로 미설정 시 부팅을 막는다.
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret) {
  throw new Error('JWT_SECRET environment variable is required');
}

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable`,
  jwtSecret,
  nodeEnv: process.env.NODE_ENV || 'development'
};