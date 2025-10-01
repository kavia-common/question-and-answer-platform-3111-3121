import { Component, OnDestroy, OnInit, inject, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser, CommonModule } from '@angular/common';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AnswersService, QuestionsService } from '../../services/qna.service';
import { AnswerOut, QuestionOut } from '../../models/api.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qna',
  standalone: true,
  imports: [CommonModule, SidebarComponent, ReactiveFormsModule, HttpClientModule],
  templateUrl: './qna.component.html',
  styleUrl: './qna.component.css'
})
export class QnaComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private questionsService = inject(QuestionsService);
  private answersService = inject(AnswersService);
  private router = inject(Router);
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  private toggleHandler = () => this.toggleSidebar();

  sidebarOpen = true;
  questions: QuestionOut[] = [];
  selected: QuestionOut | null = null;
  answers: AnswerOut[] = [];
  loadingQuestions = false;
  loadingAnswers = false;
  submitting = false;
  submitError: string | null = null;

  askForm = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(200)]],
    body: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const g: any = globalThis as any;
      if (g && typeof g.addEventListener === 'function') {
        g.addEventListener('globalToggleSidebar', this.toggleHandler);
      } else if (g) {
        // Fallback: assign a simple handler container if not present
        const originalDispatch = g.dispatchEvent?.bind(g);
        const listeners: Record<string, Function[]> = (g.__listeners ||= {});
        if (typeof g.dispatchEvent !== 'function') {
          g.dispatchEvent = (e: any) => {
            const type = e?.type;
            const arr = listeners[type] || [];
            arr.forEach((fn) => fn(e));
            if (originalDispatch) originalDispatch(e);
          };
        }
        (listeners['globalToggleSidebar'] ||= []).push(this.toggleHandler);
      }
    }
    this.fetchQuestions();
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      const g: any = globalThis as any;
      if (g && typeof g.removeEventListener === 'function') {
        g.removeEventListener('globalToggleSidebar', this.toggleHandler);
      } else if (g && g.__listeners) {
        const arr: Function[] = g.__listeners['globalToggleSidebar'] || [];
        g.__listeners['globalToggleSidebar'] = arr.filter((fn: any) => fn !== this.toggleHandler);
      }
    }
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  fetchQuestions() {
    this.loadingQuestions = true;
    this.questionsService.listQuestions().subscribe({
      next: (qs) => {
        this.questions = qs;
        if (!this.selected && qs.length) {
          this.onSelect(qs[0]);
        }
      },
      error: () => {},
      complete: () => (this.loadingQuestions = false),
    });
  }

  onSelect(q: QuestionOut) {
    this.selected = q;
    this.loadAnswers(q.id);
  }

  loadAnswers(questionId: number) {
    this.loadingAnswers = true;
    this.answers = [];
    this.answersService.listAnswersForQuestion(questionId).subscribe({
      next: (ans) => (this.answers = ans),
      error: () => {},
      complete: () => (this.loadingAnswers = false),
    });
  }

  async submitQuestion() {
    if (this.askForm.invalid) {
      this.askForm.markAllAsTouched();
      return;
    }
    this.submitting = true;
    this.submitError = null;

    const payload = this.askForm.value as { title: string; body: string; };
    try {
      const created = await this.questionsService.createQuestion(payload).toPromise();
      if (created) {
        this.questions = [created, ...this.questions];
        this.selected = created;
        this.askForm.reset();
        const generated = await this.answersService.generateAnswer({ question_id: created.id, use_ai: true }).toPromise();
        if (generated) {
          this.answers = [generated, ...this.answers];
          this.loadAnswers(created.id);
        }
      }
    } catch (e: any) {
      if (e?.status === 401) {
        this.router.navigate(['/login']);
      } else {
        this.submitError = e?.error?.detail || 'Failed to submit question. Please try again.';
      }
    } finally {
      this.submitting = false;
    }
  }
}
