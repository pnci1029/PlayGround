import { DbPost } from '@/types/database.js';
import type { Post } from '../../../shared/types/index.js';

export function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

export function extractCodeLanguages(content: string): string[] {
  const codeBlockRegex = /```(\w+)/g;
  const languages = new Set<string>();
  let match;
  
  while ((match = codeBlockRegex.exec(content)) !== null) {
    languages.add(match[1]);
  }
  
  return Array.from(languages);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

export function dbPostToPost(dbPost: DbPost): Post {
  return {
    id: dbPost.id,
    title: dbPost.title,
    slug: dbPost.slug,
    content: dbPost.content,
    excerpt: dbPost.excerpt,
    category: dbPost.category,
    tags: dbPost.tags,
    publishedAt: dbPost.published_at,
    updatedAt: dbPost.updated_at,
    readingTime: dbPost.reading_time,
    codeLanguages: dbPost.code_languages,
    isPublished: dbPost.is_published
  };
}