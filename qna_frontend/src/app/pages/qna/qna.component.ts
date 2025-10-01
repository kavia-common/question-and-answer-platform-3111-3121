import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../../components/header/header.component';
import { SidebarComponent } from '../../components/sidebar/sidebar.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AnswersService, QuestionsService } from '../../services/qna.service';
import { AnswerOut, QuestionOut } from '../../models/api.models';
import { Router } from '@angular/router';

@Component({
  selector: 'app-qna',
  standalone: true,
  imports: [CommonModule, HeaderComponent, SidebarComponent, ReactiveFormsModule, HttpClientModule],
  templateUrl: './qna.component.html',
  styleUrl: './qna.component.css'
})
export class QnaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private questionsService = inject(QuestionsService);
  private answersService = inject(AnswersService);
  private router = inject(Router);

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
    this.fetchQuestions();
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
        // generate AI answer
        const generated = await this.answersService.generateAnswer({ question_id: created.id, use_ai: true }).toPromise();
        if (generated) {
          this.answers = [generated, ...this.answers];
          this.loadAnswers(created.id);
        }
      }
    } catch (e: any) {
      if (e?.status === 401) {
        // Not authenticated, redirect to login
        this.router.navigate(['/login']);
      } else {
        this.submitError = e?.error?.detail || 'Failed to submit question. Please try again.';
      }
    } finally {
      this.submitting = false;
    }
  }
}
