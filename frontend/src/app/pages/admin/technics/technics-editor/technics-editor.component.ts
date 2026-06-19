import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TechnicsService } from '../../../../core/technics/technics.service';
import { TechnicsPhoto, TECHNICS_CATEGORIES } from '../../../../core/technics/technics.model';

@Component({
  selector: 'app-technics-editor',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule],
  templateUrl: './technics-editor.component.html',
  styleUrl: './technics-editor.component.scss',
})
export class TechnicsEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly technicsService = inject(TechnicsService);

  readonly categories = TECHNICS_CATEGORIES;
  private technicsId: string | null = null;
  readonly isNew = signal(true);
  readonly saving = signal(false);
  readonly photos = signal<TechnicsPhoto[]>([]);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    category: [this.categories[0], Validators.required],
    manufacturer: [''],
    yearAcquired: [null as number | null],
    description: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.technicsId = id && id !== 'new' ? id : null;
    this.isNew.set(!this.technicsId);

    if (this.technicsId) {
      this.technicsService.get(this.technicsId).subscribe((item) => {
        this.form.patchValue({
          name: item.name,
          category: item.category,
          manufacturer: item.manufacturer ?? '',
          yearAcquired: item.yearAcquired,
          description: item.description ?? '',
        });
        this.photos.set(item.photos);
      });
    }
  }

  save(): void {
    if (this.form.invalid) {
      return;
    }
    this.saving.set(true);
    const value = this.form.getRawValue();
    const data = {
      name: value.name,
      category: value.category,
      manufacturer: value.manufacturer || undefined,
      yearAcquired: value.yearAcquired ?? undefined,
      description: value.description || undefined,
    };

    const request = this.technicsId
      ? this.technicsService.update(this.technicsId, data)
      : this.technicsService.create(data);

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/technics']);
      },
      error: () => this.saving.set(false),
    });
  }

  onFileSelected(input: HTMLInputElement): void {
    const file = input.files?.[0];
    if (!file || !this.technicsId) {
      return;
    }
    this.technicsService.uploadPhoto(this.technicsId, file).subscribe(() => {
      input.value = '';
      this.technicsService.get(this.technicsId!).subscribe((item) => this.photos.set(item.photos));
    });
  }

  removePhoto(photoId: string): void {
    this.technicsService.deletePhoto(photoId).subscribe(() => {
      this.photos.set(this.photos().filter((p) => p.id !== photoId));
    });
  }
}
