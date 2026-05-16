import { z } from 'zod';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash?: string;
  display_name?: string;
  role: 'admin' | 'editor' | 'writer' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export const createUserSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores'),
  password: z.string().min(6),
  nickname: z.string().min(1).max(50)
});

export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});

export const updateUserSchema = z.object({
  display_name: z.string().max(100).optional(),
  role: z.enum(['admin', 'editor', 'writer', 'viewer']).optional(),
  is_active: z.boolean().optional()
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;