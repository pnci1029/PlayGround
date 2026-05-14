import { FastifyPluginAsync } from 'fastify';
import { UserService } from '../services/userService.js';
import { createUserSchema, loginSchema, updateUserSchema } from '../models/user.js';

const userService = new UserService();

const usersRoutes: FastifyPluginAsync = async (fastify) => {
  // User login
  fastify.post('/login', async (request, reply) => {
    try {
      const input = loginSchema.parse(request.body);
      const result = await userService.authenticateUser(input);
      
      return reply.send(result);
    } catch (error) {
      return reply.status(401).send({ 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      });
    }
  });
  
  // Create user (admin only)
  fastify.post('/', async (request, reply) => {
    try {
      const input = createUserSchema.parse(request.body);
      const user = await userService.createUser(input);
      
      return reply.send(user);
    } catch (error) {
      return reply.status(400).send({ 
        error: error instanceof Error ? error.message : 'Failed to create user' 
      });
    }
  });
  
  // Get all users (admin only)
  fastify.get('/', async (request, reply) => {
    try {
      const users = await userService.getAllUsers();
      return reply.send(users);
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to fetch users' 
      });
    }
  });
  
  // Get user by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const user = await userService.getUserById(id);
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send(user);
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to fetch user' 
      });
    }
  });
  
  // Update user (admin only)
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const input = updateUserSchema.parse(request.body);
      
      const user = await userService.updateUser(id, input);
      
      if (!user) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send(user);
    } catch (error) {
      return reply.status(400).send({ 
        error: error instanceof Error ? error.message : 'Failed to update user' 
      });
    }
  });
  
  // Delete user (admin only)
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const success = await userService.deleteUser(id);
      
      if (!success) {
        return reply.status(404).send({ error: 'User not found' });
      }
      
      return reply.send({ message: 'User deleted successfully' });
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to delete user' 
      });
    }
  });
};

export default usersRoutes;