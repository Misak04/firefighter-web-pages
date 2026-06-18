import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { forkJoin, of, switchMap } from 'rxjs';
import { GalleryService } from '../../../../core/gallery/gallery.service';
import { GalleryEvent, Photo } from '../../../../core/gallery/gallery.model';

@Component({
  selector: 'app-event-manager',
  standalone: true,
  imports: [ButtonModule],
  templateUrl: './event-manager.component.html',
  styleUrl: './event-manager.component.scss',
})
export class EventManagerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly galleryService = inject(GalleryService);

  private eventId = '';
  readonly event = signal<GalleryEvent | null>(null);
  readonly photos = signal<Photo[]>([]);
  readonly uploading = signal(false);

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.galleryService.getEvent(this.eventId).subscribe((event) => this.event.set(event));
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.galleryService.listPhotosForEvent(this.eventId).subscribe((res) => this.photos.set(res.items));
  }

  onFilesSelected(input: HTMLInputElement): void {
    const files = input.files;
    if (!files || files.length === 0) {
      return;
    }
    const event = this.event();
    if (!event) {
      return;
    }
    this.uploading.set(true);

    const uploads = Array.from(files).map((file) =>
      this.galleryService.uploadPhoto(this.eventId, event.year, file).pipe(
        switchMap((media) => this.galleryService.attachPhoto(this.eventId, (media as { id: string }).id)),
      ),
    );

    forkJoin(uploads.length ? uploads : [of(null)]).subscribe({
      next: () => {
        this.uploading.set(false);
        input.value = '';
        this.loadPhotos();
      },
      error: () => this.uploading.set(false),
    });
  }

  deletePhoto(photoId: string): void {
    this.galleryService.deletePhoto(photoId).subscribe(() => this.loadPhotos());
  }

  move(photo: Photo, direction: -1 | 1): void {
    const list = [...this.photos()];
    const index = list.findIndex((p) => p.id === photo.id);
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= list.length) {
      return;
    }
    [list[index], list[swapIndex]] = [list[swapIndex], list[index]];

    const reordered = list.map((p, i) => ({ id: p.id, sortOrder: i }));
    this.galleryService.reorderPhotos(this.eventId, reordered).subscribe(() => this.loadPhotos());
  }
}
