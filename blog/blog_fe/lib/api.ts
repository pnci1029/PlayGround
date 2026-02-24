import type { 
  Post, 
  PostListResponse, 
  CreatePostInput, 
  UpdatePostInput, 
  PostQuery 
} from '@/types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetchApi<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  
  if (!response.ok) {
    throw new ApiError(
      `API call failed: ${response.statusText}`, 
      response.status
    );
  }
  
  return response.json();
}

export const api = {
  posts: {
    list: (query?: Partial<PostQuery>) => {
      const params = new URLSearchParams();
      
      if (query) {
        Object.entries(query).forEach(([key, value]) => {
          if (value !== undefined) {
            if (Array.isArray(value)) {
              params.append(key, value.join(','));
            } else {
              params.append(key, String(value));
            }
          }
        });
      }
      
      const queryString = params.toString();
      return fetchApi<PostListResponse>(
        `/api/posts${queryString ? `?${queryString}` : ''}`
      );
    },
    
    get: (slug: string) => 
      fetchApi<Post>(`/api/posts/${slug}`),
    
    create: (data: CreatePostInput) =>
      fetchApi<Post>('/api/posts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    
    update: (id: string, data: UpdatePostInput) =>
      fetchApi<Post>(`/api/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    
    delete: (id: string) =>
      fetchApi<{ message: string }>(`/api/posts/${id}`, {
        method: 'DELETE',
      }),
  },
};