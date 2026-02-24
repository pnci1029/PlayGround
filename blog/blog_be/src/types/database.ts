export interface DbPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  published_at: Date;
  updated_at: Date;
  reading_time: number;
  code_languages: string[];
  is_published: boolean;
  created_at: Date;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: Date;
}

export interface DbTag {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
}