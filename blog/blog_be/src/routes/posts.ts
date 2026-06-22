import { FastifyPluginAsync } from 'fastify';
import { ZodError } from 'zod';
import { PostService } from '../services/postService.js';
import {
  createPostSchema,
  updatePostSchema,
  postQuerySchema
} from '../models/post.js';
import { authenticateUser, requireRole } from '../middleware/auth.js';

const postService = new PostService();

// zod 검증 실패를 400 으로 일관되게 변환
function zodErrorResponse(error: ZodError) {
  return {
    error: '입력 데이터가 유효하지 않습니다',
    details: error.issues.map((e) => ({ field: e.path.join('.'), message: e.message }))
  };
}

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all posts
  fastify.get('/', async (request, reply) => {
    try {
      const query = postQuerySchema.parse(request.query);
      return await postService.getPosts(query);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send(zodErrorResponse(error));
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to fetch posts' });
    }
  });

  // Get single post by slug
  fastify.get('/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };
    const post = await postService.getPost(slug);

    if (!post) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    return post;
  });

  // Create new post (requires authentication)
  fastify.post('/', {
    preHandler: [authenticateUser, requireRole(['admin', 'editor', 'writer'])]
  }, async (request, reply) => {
    try {
      const input = createPostSchema.parse({
        ...(request.body as object),
        author_id: request.user!.userId,
        author_name: request.user!.username
      });
      return await postService.createPost(input);
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send(zodErrorResponse(error));
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to create post' });
    }
  });

  // Update post (requires authentication; writer 는 본인 글만 수정 가능)
  fastify.put('/:id', {
    preHandler: [authenticateUser, requireRole(['admin', 'editor', 'writer'])]
  }, async (request, reply) => {
    try {
      const { id } = request.params as { id: string };
      const input = updatePostSchema.parse(request.body);

      const existing = await postService.getPostById(id);
      if (!existing) {
        return reply.status(404).send({ error: 'Post not found' });
      }

      // admin/editor 는 모든 글, writer 는 자신의 글만 수정 가능
      const user = request.user!;
      if (user.role === 'writer' && existing.author_id !== user.userId) {
        return reply.status(403).send({ error: '본인이 작성한 글만 수정할 수 있습니다' });
      }

      const post = await postService.updatePost(id, input);
      return post;
    } catch (error) {
      if (error instanceof ZodError) {
        return reply.status(400).send(zodErrorResponse(error));
      }
      request.log.error(error);
      return reply.status(500).send({ error: 'Failed to update post' });
    }
  });

  // Delete post (requires authentication; admin/editor 만)
  fastify.delete('/:id', {
    preHandler: [authenticateUser, requireRole(['admin', 'editor'])]
  }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const success = await postService.deletePost(id);

    if (!success) {
      return reply.status(404).send({ error: 'Post not found' });
    }

    return { message: 'Post deleted successfully' };
  });
};

export default postsRoutes;
