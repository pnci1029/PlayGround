import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface AuthCheckRequest {
  Body: {
    username: string;
    password: string;
  };
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/check', async (request: FastifyRequest<AuthCheckRequest>, reply: FastifyReply) => {
    try {
      const { username, password } = request.body;
      
      const adminUsername = process.env.BLOG_ADMIN_USERNAME;
      const adminPassword = process.env.BLOG_ADMIN_PASSWORD;
      
      if (!adminUsername || !adminPassword) {
        return reply.status(500).send({
          error: 'Admin credentials not configured'
        });
      }
      
      if (username === adminUsername && password === adminPassword) {
        return reply.send({ success: true });
      } else {
        return reply.status(401).send({
          error: 'Invalid credentials'
        });
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });
}
