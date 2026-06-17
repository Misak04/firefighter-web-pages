import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Article, ArticleListResponse } from './article.model';

@Injectable({ providedIn: 'root' })
export class ArticlesService {
  constructor(private readonly http: HttpClient) {}

  list(page = 1, limit = 10, q?: string): Observable<ArticleListResponse> {
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (q) {
      params['q'] = q;
    }
    return this.http.get<ArticleListResponse>('/api/articles', { params });
  }

  getBySlug(slug: string): Observable<Article> {
    return this.http.get<Article>(`/api/articles/${slug}`);
  }
}
