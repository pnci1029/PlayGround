'use client';

import { useState } from 'react';
import TiptapEditor from './TiptapEditor';
import MarkdownPreview from './MarkdownPreview';
import { EditorState, PostMetadata } from '@/types';

interface EditorLayoutProps {
  initialContent?: string;
  initialMetadata?: Partial<PostMetadata>;
  onSave?: (content: string, metadata: PostMetadata) => void;
  onAutoSave?: (content: string, metadata: PostMetadata) => void;
}

export default function EditorLayout({
  initialContent = '',
  initialMetadata,
  onSave,
  onAutoSave
}: EditorLayoutProps) {
  const [editorState, setEditorState] = useState<EditorState>({
    content: initialContent,
    mode: 'visual',
    isLoading: false,
    hasUnsavedChanges: false,
  });

  const [metadata, setMetadata] = useState<PostMetadata>({
    title: initialMetadata?.title || '',
    category: initialMetadata?.category || '',
    tags: initialMetadata?.tags || [],
    excerpt: initialMetadata?.excerpt || '',
    isPublished: initialMetadata?.isPublished || false,
  });

  const [tagInput, setTagInput] = useState('');

  const handleContentChange = (content: string) => {
    setEditorState(prev => ({
      ...prev,
      content,
      hasUnsavedChanges: true,
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(editorState.content, metadata);
      setEditorState(prev => ({ ...prev, hasUnsavedChanges: false }));
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="border-b border-gray-200 bg-surface-elevated">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">새 포스트 작성</h1>
              {editorState.hasUnsavedChanges && (
                <span className="text-sm text-text-muted">저장되지 않은 변경사항</span>
              )}
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setEditorState(prev => ({ ...prev, mode: 'visual' }))}
                  className={`px-3 py-1 text-sm rounded ${
                    editorState.mode === 'visual' 
                      ? 'bg-white shadow-sm text-text-primary' 
                      : 'text-text-muted'
                  }`}
                >
                  편집
                </button>
                <button
                  onClick={() => setEditorState(prev => ({ ...prev, mode: 'preview' }))}
                  className={`px-3 py-1 text-sm rounded ${
                    editorState.mode === 'preview' 
                      ? 'bg-white shadow-sm text-text-primary' 
                      : 'text-text-muted'
                  }`}
                >
                  미리보기
                </button>
              </div>
              
              <button 
                onClick={handleSave}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                저장
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Metadata Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface-elevated rounded-lg p-6 sticky top-8">
              <h2 className="text-lg font-semibold mb-4">포스트 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    제목
                  </label>
                  <input
                    type="text"
                    value={metadata.title}
                    onChange={(e) => setMetadata(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="포스트 제목"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    카테고리
                  </label>
                  <input
                    type="text"
                    value={metadata.category}
                    onChange={(e) => setMetadata(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="개발, 독서, ..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    태그
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                      placeholder="태그 입력"
                    />
                    <button
                      onClick={addTag}
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                    >
                      추가
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {metadata.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 bg-primary-soft text-primary text-sm rounded-full"
                      >
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 text-primary hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    요약
                  </label>
                  <textarea
                    value={metadata.excerpt}
                    onChange={(e) => setMetadata(prev => ({ ...prev, excerpt: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-sm"
                    rows={4}
                    placeholder="포스트에 대한 간단한 설명..."
                  />
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="published"
                    checked={metadata.isPublished}
                    onChange={(e) => setMetadata(prev => ({ ...prev, isPublished: e.target.checked }))}
                    className="mr-2"
                  />
                  <label htmlFor="published" className="text-sm">
                    즉시 게시
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="lg:col-span-3">
            {editorState.mode === 'visual' ? (
              <TiptapEditor
                initialContent={editorState.content}
                onContentChange={handleContentChange}
              />
            ) : (
              <div className="border border-gray-200 rounded-lg p-6 bg-surface min-h-[600px]">
                <MarkdownPreview content={editorState.content} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}