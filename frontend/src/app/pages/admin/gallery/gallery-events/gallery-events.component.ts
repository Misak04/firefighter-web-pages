import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { GalleryService } from '../../../../core/gallery/gallery.service';
import { GalleryEvent } from '../../../../core/gallery/gallery.model';

@Component({
  selector: 'app-gallery-events',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './gallery-events.component.html',
  styleUrl: './gallery-events.component.scss',
})
export class GalleryEventsComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly galleryService = inject(GalleryService);

  readonly events = signal<GalleryEvent[]>([]);
  readonly creating = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    year: [new Date().getFullYear(), Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.galleryService.listYears().subscribe((years) => {
      if (years.length === 0) {
        this.events.set([]);
        return;
      }
      forkJoin(years.map((y) => this.galleryService.listEventsForYear(y))).subscribe((eventLists) => {
        this.events.set(eventLists.flat());
      });
    });
  }

  createEvent(): void {
    if (this.form.invalid) {
      return;
    }
    this.creating.set(true);
    const { name, year, description } = this.form.getRawValue();
    this.galleryService.createEvent({ name, year, description: description || undefined }).subscribe({
      next: () => {
        this.creating.set(false);
        this.form.reset({ name: '', year: new Date().getFullYear(), description: '' });
        this.load();
      },
      error: () => this.creating.set(false),
    });
  }
}
