import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { GalleriaModule } from 'primeng/galleria';
import { GalleryService } from '../../core/gallery/gallery.service';
import { GalleryEvent, Photo } from '../../core/gallery/gallery.model';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [RouterLink, GalleriaModule],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss',
})
export class GalleryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly galleryService = inject(GalleryService);

  readonly years = signal<number[]>([]);
  readonly events = signal<GalleryEvent[]>([]);
  readonly photos = signal<Photo[]>([]);

  readonly year = signal<number | null>(null);
  readonly eventId = signal<string | null>(null);

  ngOnInit(): void {
    const params = this.route.snapshot.paramMap;
    const year = params.get('year');
    const eventId = params.get('event');

    if (!year) {
      this.galleryService.listYears().subscribe((years) => this.years.set(years));
      return;
    }

    this.year.set(Number(year));

    if (!eventId) {
      this.galleryService.listEventsForYear(Number(year)).subscribe((events) => this.events.set(events));
      return;
    }

    this.eventId.set(eventId);
    this.galleryService.listPhotosForEvent(eventId).subscribe((res) => this.photos.set(res.items));
  }
}
