import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';

interface AuthCheckRequest {
  Body: {
    password: string;
  };
}

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/check', async (request: FastifyRequest<AuthCheckRequest>, reply: FastifyReply) => {
    try {
      const { password } = request.body;
      
      const adminPassword = process.env.BLOG_ADMIN_PASSWORD;
      
      if (!adminPassword) {
        return reply.status(500).send({
          error: 'Admin password not configured'
        });
      }
      
      if (password === adminPassword) {
        return reply.send({ success: true });
      } else {
        return reply.status(401).send({
          error: 'Invalid password'
        });
      }
    } catch (error) {
      return reply.status(500).send({
        error: 'Internal server error'
      });
    }
  });
}