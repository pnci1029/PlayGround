export const config = {
  server: {
    port: parseInt(process.env.PORT || '8082'),
    host: process.env.HOST || '0.0.0.0',
  },
  cors: {
    origin: [
      'http://localhost:3002',
      'https://*.yourdomain.com'
    ],
    credentials: true
  },
  api: {
    prefix: '/api'
  }
}