import { describe, it, expect } from 'vitest';
import { createUserSchema } from './user.js';
import { createPostSchema, postQuerySchema } from './post.js';

describe('createUserSchema', () => {
  it('유효한 입력을 통과시킨다', () => {
    const r = createUserSchema.safeParse({ username: 'kimchi', password: 'secret1', nickname: '김치' });
    expect(r.success).toBe(true);
  });

  it('3자 미만 username 을 거부한다', () => {
    expect(createUserSchema.safeParse({ username: 'ab', password: 'secret1', nickname: 'x' }).success).toBe(false);
  });

  it('허용되지 않는 문자가 든 username 을 거부한다', () => {
    expect(createUserSchema.safeParse({ username: 'kim chi!', password: 'secret1', nickname: 'x' }).success).toBe(false);
  });

  it('6자 미만 password 를 거부한다', () => {
    expect(createUserSchema.safeParse({ username: 'kimchi', password: '123', nickname: 'x' }).success).toBe(false);
  });
});

describe('createPostSchema', () => {
  const base = {
    title: '제목', slug: 'my-post', content: '본문', excerpt: '요약',
    category: 'dev', author_id: '550e8400-e29b-41d4-a716-446655440000',
  };

  it('author_id 가 UUID 가 아니면 거부한다', () => {
    expect(createPostSchema.safeParse({ ...base, author_id: 'not-a-uuid' }).success).toBe(false);
  });

  it('대문자/공백이 든 slug 를 거부한다', () => {
    expect(createPostSchema.safeParse({ ...base, slug: 'Bad Slug' }).success).toBe(false);
  });

  it('tags/isPublished 기본값을 채운다', () => {
    const r = createPostSchema.parse(base);
    expect(r.tags).toEqual([]);
    expect(r.isPublished).toBe(false);
  });
});

describe('postQuerySchema', () => {
  it('기본값을 채운다', () => {
    const r = postQuerySchema.parse({});
    expect(r.page).toBe(1);
    expect(r.limit).toBe(10);
    expect(r.sortBy).toBe('publishedAt');
    expect(r.sortOrder).toBe('desc');
  });

  it('쿼리스트링 숫자를 강제 변환한다', () => {
    const r = postQuerySchema.parse({ page: '3', limit: '20' });
    expect(r.page).toBe(3);
    expect(r.limit).toBe(20);
  });

  it('콤마 구분 tags 문자열을 배열로 변환한다', () => {
    const r = postQuerySchema.parse({ tags: 'a,b,c' });
    expect(r.tags).toEqual(['a', 'b', 'c']);
  });

  it('limit 상한(100)을 넘으면 거부한다', () => {
    expect(postQuerySchema.safeParse({ limit: '101' }).success).toBe(false);
  });
});
