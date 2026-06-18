export interface Article {
  id: string;
  title: string;
  slug: string;
  body: string;
  status: 'DRAFT' | 'PUBLISHED';
  authorId: string;
  publishedAt: string | null;
  featuredImageId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleListResponse {
  items: Article[];
  total: number;
  page: number;
  limit: number;
}
