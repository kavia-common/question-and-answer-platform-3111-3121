import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HttpClientModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error: string | null = null;

  form = this.fb.group({
    full_name: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading = true;
    this.error = null;
    try {
      await this.auth.signup(this.form.value as any).toPromise();
      // After signup, log in
      const { email, password } = this.form.value;
      await this.auth.login(email!, password!).toPromise();
      await this.auth.loadMe().toPromise();
      this.router.navigate(['/qna']);
    } catch (e: any) {
      // Prefer backend-provided message
      const detail = e?.error?.detail;
      if (typeof detail === 'string' && detail) {
        this.error = detail;
      } else if (Array.isArray(detail) && detail.length) {
        // FastAPI validation errors array
        const first = detail[0];
        this.error = first?.msg || 'Validation error. Please review the form.';
      } else if (e?.status === 0) {
        // Network/CORS/backend unreachable
        this.error = 'Unable to reach server. Please check your connection or try again shortly.';
      } else {
        this.error = 'Signup failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }
}
