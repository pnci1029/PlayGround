import { FastifyPluginAsync } from 'fastify';
import { PostService } from '@/services/postService.js';
import { 
  createPostSchema, 
  updatePostSchema, 
  postQuerySchema 
} from '@/models/post.js';

const postService = new PostService();

const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // Get all posts
  fastify.get('/', async (request) => {
    const query = postQuerySchema.parse(request.query);
    return await postService.getPosts(query);
  });
  
  // Get single post by slug
  fastify.get('/:slug', async (request) => {
    const { slug } = request.params as { slug: string };
    const post = await postService.getPost(slug);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return post;
  });
  
  // Create new post
  fastify.post('/', async (request) => {
    const input = createPostSchema.parse(request.body);
    return await postService.createPost(input);
  });
  
  // Update post
  fastify.put('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const input = updatePostSchema.parse(request.body);
    
    const post = await postService.updatePost(id, input);
    
    if (!post) {
      throw new Error('Post not found');
    }
    
    return post;
  });
  
  // Delete post
  fastify.delete('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const success = await postService.deletePost(id);
    
    if (!success) {
      throw new Error('Post not found');
    }
    
    return { message: 'Post deleted successfully' };
  });
};

export default postsRoutes;