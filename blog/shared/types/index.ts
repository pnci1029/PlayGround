export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number;
  codeLanguages: string[];
  isPublished: boolean;
}

export interface CreatePostInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  isPublished: boolean;
}

export interface UpdatePostInput extends Partial<CreatePostInput> {
  id: string;
}

export interface PostQuery {
  page?: number;
  limit?: number;
  category?: string;
  tags?: string[];
  search?: string;
  sortBy?: 'publishedAt' | 'updatedAt' | 'readingTime';
  sortOrder?: 'asc' | 'desc';
}

export interface PostListResponse {
  posts: Post[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}