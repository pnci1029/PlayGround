'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { createLowlight } from 'lowlight';
import { common } from 'lowlight';
import { EditorProps } from '@/types';
import { useState } from 'react';

const lowlight = createLowlight();
lowlight.register(common);

const languages = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'cpp', label: 'C++' },
  { value: 'c', label: 'C' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'php', label: 'PHP' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'swift', label: 'Swift' },
  { value: 'kotlin', label: 'Kotlin' },
  { value: 'dart', label: 'Dart' },
  { value: 'sql', label: 'SQL' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'scss', label: 'SCSS' },
  { value: 'json', label: 'JSON' },
  { value: 'yaml', label: 'YAML' },
  { value: 'xml', label: 'XML' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'bash', label: 'Bash' },
  { value: 'shell', label: 'Shell' },
  { value: 'dockerfile', label: 'Dockerfile' },
  { value: 'nginx', label: 'Nginx' },
  { value: 'apache', label: 'Apache' },
  { value: 'plaintext', label: 'Plain Text' },
  { value: 'jsx', label: 'React JSX' },
  { value: 'tsx', label: 'TypeScript JSX' },
  { value: 'vue', label: 'Vue' },
  { value: 'svelte', label: 'Svelte' },
  { value: 'graphql', label: 'GraphQL' },
  { value: 'redis', label: 'Redis' },
  { value: 'mongodb', label: 'MongoDB' },
  { value: 'terraform', label: 'Terraform' },
  { value: 'kubernetes', label: 'Kubernetes' },
];

export default function TiptapEditor({
  initialContent = '',
  placeholder = '블로그 포스트를 작성해보세요...',
  onContentChange,
  className = ''
}: EditorProps) {
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
        defaultLanguage: 'javascript',
      }),
      Placeholder.configure({
        placeholder,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary hover:text-blue-600 underline',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose max-w-none focus:outline-none min-h-[500px] p-4',
      },
    },
  });

  if (!editor) {
    return <div className="animate-pulse bg-surface-elevated h-96 rounded-lg" />;
  }

  return (
    <div className={`border border-gray-200 rounded-lg overflow-hidden ${className}`}>
      <div className="border-b border-gray-200 bg-surface-elevated px-4 py-3">
        <div className="flex items-center justify-between">
          {/* 텍스트 스타일링 */}
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('bold') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="굵게 (Ctrl+B)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('italic') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="기울임 (Ctrl+I)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleStrike().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('strike') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="취소선"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7.24 8.75c-.26-.48-.39-1.03-.39-1.67 0-.61.13-1.16.4-1.67.26-.5.63-.93 1.11-1.29.48-.35 1.05-.63 1.7-.83.66-.19 1.39-.29 2.18-.29.81 0 1.54.11 2.21.34.66.22 1.23.54 1.69.94.47.4.83.88 1.08 1.43.25.55.38 1.15.38 1.81h-3.01c0-.31-.05-.59-.15-.85-.09-.27-.24-.49-.44-.68-.2-.19-.45-.33-.75-.44-.3-.1-.66-.16-1.06-.16-.39 0-.74.04-1.03.13-.29.09-.53.21-.72.36-.19.16-.34.34-.44.55-.1.21-.15.43-.15.66 0 .48.25.88.74 1.21.38.25.77.48 1.41.7H7.39c-.05-.08-.11-.17-.15-.25zM21 12v-2H3v2h9.62c.18.07.4.14.55.2.37.17.66.34.87.51.21.17.35.36.43.57.07.2.11.43.11.69 0 .23-.05.45-.14.66-.09.2-.23.38-.42.53-.19.15-.42.26-.71.35-.29.08-.63.13-1.01.13-.43 0-.83-.04-1.18-.13-.35-.09-.65-.22-.89-.39-.25-.17-.44-.37-.58-.62-.13-.25-.20-.55-.20-.90H7.5c0 .76.13 1.59.4 2.2.26.61.65 1.15 1.18 1.61.52.46 1.15.81 1.9 1.05.75.24 1.58.36 2.5.36.85 0 1.64-.13 2.35-.38.72-.26 1.34-.61 1.87-1.06.52-.45.93-.98 1.22-1.58.29-.6.44-1.25.44-1.95 0-.59-.14-1.11-.40-1.55-.27-.44-.65-.81-1.14-1.1-.27-.15-.58-.29-.91-.42H21z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleCode().run()}
                className={`p-2 text-sm rounded font-mono hover:bg-gray-200 transition-colors ${
                  editor.isActive('code') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="인라인 코드"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                </svg>
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* 헤딩 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('heading', { level: 1 }) 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="제목 1"
              >
                H1
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('heading', { level: 2 }) 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="제목 2"
              >
                H2
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                className={`px-2 py-1 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('heading', { level: 3 }) 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="제목 3"
              >
                H3
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* 리스트 & 인용 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('bulletList') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="글머리 기호 목록"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('orderedList') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="번호 목록"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('blockquote') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="인용문"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
                </svg>
              </button>
              <button
                type="button"
                onClick={() => editor.chain().focus().toggleTaskList().run()}
                className={`p-2 text-sm rounded hover:bg-gray-200 transition-colors ${
                  editor.isActive('taskList') 
                    ? 'bg-primary text-white hover:bg-blue-600' 
                    : 'text-gray-700'
                }`}
                title="체크리스트"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,10H2V12H14V10M14,6H2V8H14V6M2,16H14V14H2V16M21.5,11.5L23,13L16,20L11.5,15.5L13,14L16,17L21.5,11.5Z"/>
                </svg>
              </button>
            </div>
            
            <div className="w-px h-6 bg-gray-300 mx-2" />
            
            {/* 테이블 */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
                className="p-2 text-sm rounded hover:bg-gray-200 transition-colors text-gray-700"
                title="테이블 추가 (3x3)"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M4,3H20A1,1 0 0,1 21,4V20A1,1 0 0,1 20,21H4A1,1 0 0,1 3,20V4A1,1 0 0,1 4,3M5,5V9H11V5H5M13,5V9H19V5H13M5,11V15H11V11H5M13,11V15H19V11H13M5,17V19H11V17H5M13,17V19H19V17H13Z"/>
                </svg>
              </button>
              {editor?.isActive('table') && (
                <>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowBefore().run()}
                    className="p-1 text-xs rounded hover:bg-gray-200 transition-colors text-gray-600"
                    title="행 추가 (위)"
                  >
                    +↑
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addRowAfter().run()}
                    className="p-1 text-xs rounded hover:bg-gray-200 transition-colors text-gray-600"
                    title="행 추가 (아래)"
                  >
                    +↓
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnBefore().run()}
                    className="p-1 text-xs rounded hover:bg-gray-200 transition-colors text-gray-600"
                    title="열 추가 (좌)"
                  >
                    +←
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().addColumnAfter().run()}
                    className="p-1 text-xs rounded hover:bg-gray-200 transition-colors text-gray-600"
                    title="열 추가 (우)"
                  >
                    +→
                  </button>
                  <button
                    type="button"
                    onClick={() => editor.chain().focus().deleteTable().run()}
                    className="p-1 text-xs rounded hover:bg-red-200 transition-colors text-red-600"
                    title="테이블 삭제"
                  >
                    ✕
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* 코드 블록 */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 text-sm rounded bg-gray-100 hover:bg-gray-200 transition-colors"
                title="코드 블록 언어 선택"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                </svg>
                {languages.find(lang => lang.value === selectedLanguage)?.label || 'JavaScript'}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 10l5 5 5-5z"/>
                </svg>
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto min-w-[160px]">
                  {languages.map((language) => (
                    <button
                      key={language.value}
                      onClick={() => {
                        setSelectedLanguage(language.value);
                        setShowLanguageDropdown(false);
                        editor.chain().focus().toggleCodeBlock({ language: language.value }).run();
                      }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 transition-colors"
                    >
                      {language.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            <button
              type="button"
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className="p-2 text-sm rounded hover:bg-gray-200 transition-colors text-gray-700"
              title="구분선 추가"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13H5v-2h14v2z"/>
              </svg>
            </button>
            
            <button
              type="button"
              onClick={() => {
                const url = window.prompt('링크 URL을 입력하세요:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              className="p-2 text-sm rounded hover:bg-gray-200 transition-colors text-gray-700"
              title="링크 추가"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H6.9C4.01 7 1.6 9.42 1.6 12s2.41 5 5.3 5h4v-1.9H6.9c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9.1-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.89 0 5.3-2.42 5.3-5s-2.41-5-5.3-5z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
      <EditorContent 
        editor={editor} 
        className="bg-surface min-h-[500px]"
      />
    </div>
  );
}