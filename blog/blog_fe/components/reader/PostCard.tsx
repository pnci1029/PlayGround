'use client';

import Link from 'next/link';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
  variant?: 'default' | 'featured' | 'compact';
}

export default function PostCard({ post, variant = 'default' }: PostCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  if (variant === 'compact') {
    return (
      <article className="border-b border-gray-100 py-4 last:border-b-0">
        <Link href={`/post/${post.slug}`} className="block group">
          <h3 className="text-lg font-medium text-text-primary group-hover:text-primary transition-colors mb-2">
            {post.title}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-text-muted">
            <time>{formatDate(post.publishedAt)}</time>
            <span>{post.readingTime}분</span>
            <span>{post.category}</span>
          </div>
        </Link>
      </article>
    );
  }

  if (variant === 'featured') {
    return (
      <article className="bg-surface-elevated rounded-xl p-8 mb-8">
        <div className="mb-4">
          <span className="inline-block px-3 py-1 bg-primary-soft text-primary rounded-full text-sm font-medium">
            {post.category}
          </span>
        </div>
        
        <Link href={`/post/${post.slug}`} className="block group">
          <h2 className="text-3xl font-bold text-text-primary group-hover:text-primary transition-colors mb-4">
            {post.title}
          </h2>
          
          <p className="text-reading text-text-primary leading-relaxed mb-6">
            {post.excerpt}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6 text-text-secondary text-sm">
              <time>{formatDate(post.publishedAt)}</time>
              <span>{post.readingTime}분 읽기</span>
              {post.codeLanguages.length > 0 && (
                <div className="flex space-x-1">
                  {post.codeLanguages.slice(0, 3).map((lang, index) => (
                    <span key={index} className="font-mono text-xs">
                      {lang}
                      {index < Math.min(post.codeLanguages.length, 3) - 1 && ','}
                    </span>
                  ))}
                  {post.codeLanguages.length > 3 && <span className="text-xs">+</span>}
                </div>
              )}
            </div>
            
            <span className="text-primary text-sm font-medium group-hover:underline">
              읽어보기 →
            </span>
          </div>
        </Link>
        
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            {post.tags.slice(0, 5).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-surface text-text-muted text-xs rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </article>
    );
  }

  // Default variant
  return (
    <article className="border-b border-gray-100 pb-8 mb-8 last:border-b-0">
      <div className="flex items-start justify-between mb-3">
        <span className="inline-block px-3 py-1 bg-primary-soft text-primary rounded-full text-sm font-medium">
          {post.category}
        </span>
        <time className="text-text-muted text-sm">{formatDate(post.publishedAt)}</time>
      </div>
      
      <Link href={`/post/${post.slug}`} className="block group">
        <h2 className="text-2xl font-semibold text-text-primary group-hover:text-primary transition-colors mb-3">
          {post.title}
        </h2>
        
        <p className="text-reading text-text-primary leading-relaxed mb-4">
          {post.excerpt}
        </p>
      </Link>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6 text-text-secondary text-sm">
          <span>{post.readingTime}분 읽기</span>
          {post.codeLanguages.length > 0 && (
            <div className="flex items-center space-x-1">
              <span>언어:</span>
              <div className="flex space-x-1">
                {post.codeLanguages.slice(0, 3).map((lang, index) => (
                  <span key={index} className="font-mono text-xs bg-code-bg px-1 rounded">
                    {lang}
                  </span>
                ))}
                {post.codeLanguages.length > 3 && (
                  <span className="text-xs">+{post.codeLanguages.length - 3}</span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {post.tags.length > 0 && (
          <div className="flex space-x-2">
            {post.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block px-2 py-1 bg-surface-elevated text-text-muted text-xs rounded"
              >
                #{tag}
              </span>
            ))}
            {post.tags.length > 3 && (
              <span className="text-xs text-text-muted">+{post.tags.length - 3}</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
}