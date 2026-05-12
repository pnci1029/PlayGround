if (!process.env.PORT) {
  throw new Error('PORT environment variable is required')
}
if (!process.env.HOST) {
  throw new Error('HOST environment variable is required')
}

export const config = {
  server: {
    port: parseInt(process.env.PORT),
    host: process.env.HOST,
  },
  cors: {
    origin: [
      'http://localhost:3000',
      'http://localhost:3002',
      'http://admin.localhost:3002',
      'http://blog.localhost:3002',
      'http://menu.localhost:3002',
      'http://diary.localhost:3002',
      'http://portfolio.localhost:3002',
      'https://chhong.kr',
      'https://playground.chhong.kr',
      'https://*.yourdomain.com',
      'https://*.playground.com'
    ],
    credentials: true
  },
  api: {
    prefix: '/api'
  }
}