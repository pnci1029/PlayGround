export type { 
  Post, 
  CreatePostInput, 
  UpdatePostInput, 
  PostQuery, 
  PostListResponse,
  Category,
  Tag 
} from '../../shared/types/index.js';

export interface EditorState {
  content: string;
  mode: 'markdown' | 'visual' | 'preview';
  isLoading: boolean;
  hasUnsavedChanges: boolean;
}

export interface PostMetadata {
  title: string;
  category: string;
  tags: string[];
  excerpt: string;
  isPublished: boolean;
}

export interface EditorProps {
  initialContent?: string;
  placeholder?: string;
  onContentChange: (content: string) => void;
  className?: string;
}