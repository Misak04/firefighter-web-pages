import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { DatePipe } from '@angular/common';
import { ArticlesService } from '../../core/articles/articles.service';
import { Article } from '../../core/articles/article.model';

@Component({
  selector: 'app-article-detail',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
})
export class ArticleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly articlesService = inject(ArticlesService);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);

  readonly article = signal<Article | null>(null);
  readonly notFound = signal(false);

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.notFound.set(true);
      return;
    }

    this.articlesService.getBySlug(slug).subscribe({
      next: (article) => {
        this.article.set(article);
        this.setSeoTags(article);
      },
      error: () => this.notFound.set(true),
    });
  }

  private setSeoTags(article: Article): void {
    this.title.setTitle(article.title);
    this.meta.updateTag({ property: 'og:title', content: article.title });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    this.meta.updateTag({ name: 'description', content: this.excerpt(article.body) });
    this.meta.updateTag({ property: 'og:description', content: this.excerpt(article.body) });
  }

  private excerpt(html: string): string {
    return html.replace(/<[^>]*>/g, '').slice(0, 160);
  }
}
