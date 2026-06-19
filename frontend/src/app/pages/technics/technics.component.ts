import { Component, OnInit, inject, signal } from '@angular/core';
import { TabsModule } from 'primeng/tabs';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { GalleriaModule } from 'primeng/galleria';
import { TechnicsService } from '../../core/technics/technics.service';
import { Technics, TechnicsCategory, TECHNICS_CATEGORIES } from '../../core/technics/technics.model';

@Component({
  selector: 'app-technics',
  standalone: true,
  imports: [TabsModule, CardModule, DialogModule, GalleriaModule],
  templateUrl: './technics.component.html',
  styleUrl: './technics.component.scss',
})
export class TechnicsComponent implements OnInit {
  private readonly technicsService = inject(TechnicsService);

  readonly categories = TECHNICS_CATEGORIES;
  readonly items = signal<Technics[]>([]);
  readonly selected = signal<Technics | null>(null);

  ngOnInit(): void {
    this.loadCategory(this.categories[0]);
  }

  loadCategory(category: string | number): void {
    this.technicsService.list(category as TechnicsCategory).subscribe((res) => this.items.set(res.items));
  }

  open(item: Technics): void {
    this.selected.set(item);
  }

  close(): void {
    this.selected.set(null);
  }
}
