import 'dotenv/config';

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  databaseUrl: process.env.DATABASE_URL || 'postgresql://localhost:5432/blog_db',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  nodeEnv: process.env.NODE_ENV || 'development'
};