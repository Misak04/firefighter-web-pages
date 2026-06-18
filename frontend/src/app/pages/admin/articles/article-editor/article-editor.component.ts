import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { ArticlesService } from '../../../../core/articles/articles.service';

@Component({
  selector: 'app-article-editor',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './article-editor.component.html',
  styleUrl: './article-editor.component.scss',
})
export class ArticleEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('editorEl') editorEl!: ElementRef<HTMLDivElement>;

  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly articlesService = inject(ArticlesService);

  private editor?: Editor;
  private articleId: string | null = null;

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
  });
  readonly saving = signal(false);
  readonly isNew = signal(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.articleId = id && id !== 'new' ? id : null;
    this.isNew.set(!this.articleId);
  }

  ngAfterViewInit(): void {
    this.editor = new Editor({
      element: this.editorEl.nativeElement,
      extensions: [StarterKit],
    });

    if (this.articleId) {
      this.articlesService.getByIdForAdmin(this.articleId).subscribe((article) => {
        this.form.patchValue({ title: article.title });
        this.editor?.commands.setContent(article.body);
      });
    }
  }

  ngOnDestroy(): void {
    this.editor?.destroy();
  }

  save(status: 'DRAFT' | 'PUBLISHED'): void {
    if (this.form.invalid || !this.editor) {
      return;
    }
    this.saving.set(true);
    const { title } = this.form.getRawValue();
    const body = this.editor.getHTML();

    const request = this.articleId
      ? this.articlesService.update(this.articleId, { title, body, status })
      : this.articlesService.create({ title, body, status });

    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.router.navigate(['/admin/articles']);
      },
      error: () => this.saving.set(false),
    });
  }
}
