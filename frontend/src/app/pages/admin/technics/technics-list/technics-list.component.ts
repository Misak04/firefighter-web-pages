import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { forkJoin } from 'rxjs';
import { TechnicsService } from '../../../../core/technics/technics.service';
import { Technics, TECHNICS_CATEGORIES } from '../../../../core/technics/technics.model';

@Component({
  selector: 'app-technics-list',
  standalone: true,
  imports: [RouterLink, ButtonModule, TagModule],
  templateUrl: './technics-list.component.html',
  styleUrl: './technics-list.component.scss',
})
export class TechnicsListComponent implements OnInit {
  private readonly technicsService = inject(TechnicsService);

  readonly items = signal<Technics[]>([]);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    forkJoin(TECHNICS_CATEGORIES.map((c) => this.technicsService.list(c))).subscribe((lists) => {
      this.items.set(lists.flatMap((l) => l.items));
    });
  }

  remove(id: string): void {
    this.technicsService.delete(id).subscribe(() => this.load());
  }
}
