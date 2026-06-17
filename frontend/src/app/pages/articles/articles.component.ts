import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { ArticlesService } from '../../core/articles/articles.service';
import { Article } from '../../core/articles/article.model';

@Component({
  selector: 'app-articles',
  standalone: true,
  imports: [RouterLink, DatePipe],
  templateUrl: './articles.component.html',
  styleUrl: './articles.component.scss',
})
export class ArticlesComponent implements OnInit {
  private readonly articlesService = inject(ArticlesService);

  readonly articles = signal<Article[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly limit = 10;

  ngOnInit(): void {
    this.loadPage(1);
  }

  loadPage(page: number): void {
    this.articlesService.list(page, this.limit).subscribe((res) => {
      this.articles.set(res.items);
      this.total.set(res.total);
      this.page.set(res.page);
    });
  }

  get hasNextPage(): boolean {
    return this.page() * this.limit < this.total();
  }

  get hasPrevPage(): boolean {
    return this.page() > 1;
  }
}
