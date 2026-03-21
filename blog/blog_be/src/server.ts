import Fastify from 'fastify';
import cors from '@fastify/cors';
import { config } from '@/utils/config.js';
import { initializeDatabase } from '@/utils/database.js';
import postsRoutes from '@/routes/posts.js';
import authRoutes from '@/routes/auth.js';

const fastify = Fastify({
  logger: true
});

async function start() {
  try {
    // Register plugins
    await fastify.register(cors, {
      origin: ['https://blog.chhong.kr', 'http://localhost:3003', 'http://localhost:3000', 'http://localhost:3001'],
      credentials: true
    });
    
    // Initialize database
    await initializeDatabase();
    
    // Register routes
    await fastify.register(postsRoutes, { prefix: '/api/posts' });
    await fastify.register(authRoutes, { prefix: '/api/auth' });
    
    // Health check
    fastify.get('/health', async () => {
      return { status: 'healthy', timestamp: new Date().toISOString() };
    });
    
    // Start server
    await fastify.listen({ 
      port: config.port, 
      host: '0.0.0.0' 
    });
    
    console.log(`Server running on port ${config.port}`);
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
}

start();