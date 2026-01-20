export const config = {
  server: {
    port: parseInt(process.env.PORT || '8085'),
    host: process.env.HOST || '0.0.0.0',
  },
  cors: {
    origin: [
      'http://localhost:3002',
      'http://admin.localhost:3002',
      'http://blog.localhost:3002',
      'http://menu.localhost:3002',
      'http://diary.localhost:3002',
      'http://portfolio.localhost:3002',
      'https://*.yourdomain.com',
      'https://*.playground.com'
    ],
    credentials: true
  },
  api: {
    prefix: '/api'
  }
}