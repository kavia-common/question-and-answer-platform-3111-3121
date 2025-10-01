import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AnswerOut, GenerateAnswerRequest, QuestionCreate, QuestionOut } from '../models/api.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuestionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}`;

  // PUBLIC_INTERFACE
  listQuestions(): Observable<QuestionOut[]> {
    /** Gets list of questions ordered newest first. */
    return this.http.get<QuestionOut[]>(`${this.base}/questions`);
  }

  // PUBLIC_INTERFACE
  createQuestion(payload: QuestionCreate): Observable<QuestionOut> {
    /** Creates a question (auth required). */
    return this.http.post<QuestionOut>(`${this.base}/questions`, payload);
  }

  // PUBLIC_INTERFACE
  getQuestion(question_id: number): Observable<QuestionOut> {
    /** Retrieves a single question by id. */
    return this.http.get<QuestionOut>(`${this.base}/questions/${question_id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class AnswersService {
  private http = inject(HttpClient);
  private base = `${environment.apiBaseUrl}`;

  // PUBLIC_INTERFACE
  listAnswers(): Observable<AnswerOut[]> {
    /** Lists all answers. */
    return this.http.get<AnswerOut[]>(`${this.base}/answers`);
  }

  // PUBLIC_INTERFACE
  generateAnswer(payload: GenerateAnswerRequest): Observable<AnswerOut> {
    /** Generates or creates an answer for a question. */
    return this.http.post<AnswerOut>(`${this.base}/answers`, payload);
  }

  // PUBLIC_INTERFACE
  listAnswersForQuestion(question_id: number): Observable<AnswerOut[]> {
    /** Lists all answers for a specific question. */
    return this.http.get<AnswerOut[]>(`${this.base}/questions/${question_id}/answers`);
  }
}
