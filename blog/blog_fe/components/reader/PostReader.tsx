'use client';

import { useState, useEffect } from 'react';
import MarkdownPreview from '@/components/editor/MarkdownPreview';
import { Post } from '@/types';

interface PostReaderProps {
  post: Post;
}

interface ReadingProgress {
  percentage: number;
  estimatedTimeLeft: number;
}

export default function PostReader({ post }: PostReaderProps) {
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>({
    percentage: 0,
    estimatedTimeLeft: post.readingTime
  });

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percentage = Math.min((scrollTop / docHeight) * 100, 100);
      
      const timeLeft = Math.max(
        0, 
        Math.ceil(post.readingTime * (1 - percentage / 100))
      );
      
      setReadingProgress({
        percentage,
        estimatedTimeLeft: timeLeft
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [post.readingTime]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-surface-elevated z-50">
        <div 
          className="h-full bg-primary transition-all duration-150"
          style={{ width: `${readingProgress.percentage}%` }}
        />
      </div>

      <article className="min-h-screen bg-surface">
        <div className="reading-container px-6 py-12">
          {/* Post Header */}
          <header className="mb-12">
            <div className="mb-6">
              <span className="inline-block px-3 py-1 bg-primary-soft text-primary rounded-full text-sm font-medium">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl font-bold text-text-primary mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex items-center justify-between text-text-secondary mb-8">
              <div className="flex items-center space-x-6">
                <time dateTime={post.publishedAt.toString()}>
                  {formatDate(post.publishedAt)}
                </time>
                <span>{post.readingTime}분 읽기</span>
                {readingProgress.percentage > 0 && readingProgress.estimatedTimeLeft > 0 && (
                  <span className="text-primary">
                    약 {readingProgress.estimatedTimeLeft}분 남음
                  </span>
                )}
              </div>
            </div>
            
            {post.excerpt && (
              <div className="text-reading text-text-secondary italic border-l-4 border-quote-border pl-4 mb-8">
                {post.excerpt}
              </div>
            )}
            
            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-8">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-1 bg-surface-elevated text-text-muted text-sm rounded"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            
            {post.codeLanguages.length > 0 && (
              <div className="flex items-center space-x-2 mb-8">
                <span className="text-sm text-text-muted">사용된 언어:</span>
                <div className="flex space-x-2">
                  {post.codeLanguages.map((lang, index) => (
                    <span
                      key={index}
                      className="inline-block px-2 py-1 bg-code-bg text-text-primary text-sm rounded font-mono"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </header>

          {/* Post Content */}
          <div className="post-content">
            <MarkdownPreview content={post.content} />
          </div>

          {/* Post Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-text-muted">
                마지막 수정: {formatDate(post.updatedAt)}
              </div>
              
              <div className="flex space-x-4">
                <button className="text-sm text-text-muted hover:text-primary transition-colors">
                  공유하기
                </button>
                <button className="text-sm text-text-muted hover:text-primary transition-colors">
                  피드백
                </button>
              </div>
            </div>
          </footer>
        </div>
      </article>
    </>
  );
}