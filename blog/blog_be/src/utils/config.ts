import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?sslmode=disable`,
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development'
};