import { FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';
import { CategoryService } from '../services/categoryService.js';
import { createCategorySchema, updateCategorySchema } from '../models/category.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';
import { isUuid } from '../utils/validation.js';

const categoryService = new CategoryService();

function zodErrorResponse(error: ZodError) {
  return {
    error: '입력 데이터가 유효하지 않습니다',
    details: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message }))
  };
}

const categoriesRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all categories (public)
  fastify.get('/', async (request, reply) => {
    try {
      const categories = await categoryService.getAllCategories();
      return reply.send(categories);
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to fetch categories' 
      });
    }
  });
  
  // Get active categories only (public)
  fastify.get('/active', async (request, reply) => {
    try {
      const categories = await categoryService.getActiveCategories();
      return reply.send(categories);
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to fetch active categories' 
      });
    }
  });
  
  // Get category by ID (public)
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      if (!isUuid(id)) {
        return reply.status(400).send({ error: '유효하지 않은 id 형식입니다' });
      }
      const category = await categoryService.getCategoryById(id);

      if (!category) {
        return reply.status(404).send({ error: 'Category not found' });
      }

      return reply.send(category);
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to fetch category' 
      });
    }
  });
  
  // Create category (admin only)
  fastify.post('/', {
    preHandler: [authenticateUser, requireRole(['admin'])]
  }, async (request, reply) => {
    try {
      const input = createCategorySchema.parse(request.body);
      const category = await categoryService.createCategory(input);
      
      return reply.status(201).send(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send(zodErrorResponse(error));
      }
      request.log.error(error);
      return reply.status(400).send({ error: 'Failed to create category' });
    }
  });
  
  // Update category (admin only)
  fastify.put('/:id', {
    preHandler: [authenticateUser, requireRole(['admin'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      if (!isUuid(id)) {
        return reply.status(400).send({ error: '유효하지 않은 id 형식입니다' });
      }
      const input = updateCategorySchema.parse(request.body);

      const category = await categoryService.updateCategory(id, input);

      if (!category) {
        return reply.status(404).send({ error: 'Category not found' });
      }

      return reply.send(category);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send(zodErrorResponse(error));
      }
      request.log.error(error);
      return reply.status(400).send({ error: 'Failed to update category' });
    }
  });
  
  // Delete category (admin only)
  fastify.delete('/:id', {
    preHandler: [authenticateUser, requireRole(['admin'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      if (!isUuid(id)) {
        return reply.status(400).send({ error: '유효하지 않은 id 형식입니다' });
      }
      const success = await categoryService.deleteCategory(id);
      
      if (!success) {
        return reply.status(404).send({ error: 'Category not found' });
      }
      
      return reply.send({ message: 'Category deleted successfully' });
    } catch (error) {
      return reply.status(500).send({ 
        error: 'Failed to delete category' 
      });
    }
  });
};

export default categoriesRoutes;