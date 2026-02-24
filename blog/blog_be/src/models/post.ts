import { z } from 'zod';

export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  content: z.string().min(1, 'Content is required'),
  excerpt: z.string().max(300, 'Excerpt must be less than 300 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).default([]),
  isPublished: z.boolean().default(false)
});

export const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().max(300).optional(),
  category: z.string().min(1).optional(),
  tags: z.array(z.string()).optional(),
  isPublished: z.boolean().optional()
});

export const postQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  category: z.string().optional(),
  tags: z.array(z.string()).or(z.string().transform(s => s.split(','))).optional(),
  search: z.string().optional(),
  sortBy: z.enum(['publishedAt', 'updatedAt', 'readingTime']).default('publishedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type PostQueryInput = z.infer<typeof postQuerySchema>;