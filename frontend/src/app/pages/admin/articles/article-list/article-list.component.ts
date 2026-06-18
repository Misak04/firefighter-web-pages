import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ArticlesService } from '../../../../core/articles/articles.service';
import { Article } from '../../../../core/articles/article.model';

@Component({
  selector: 'app-article-list',
  standalone: true,
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
})
export class ArticleListComponent implements OnInit {
  private readonly articlesService = inject(ArticlesService);

  readonly articles = signal<Article[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.articlesService.listForAdmin().subscribe((res) => this.articles.set(res.items));
  }

  remove(id: string): void {
    this.articlesService.delete(id).subscribe(() => this.load());
  }
}
