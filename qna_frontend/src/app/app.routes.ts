import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { QnaComponent } from './pages/qna/qna.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'qna', pathMatch: 'full' },
  { path: 'login', component: LoginComponent, title: 'Login - QnA' },
  { path: 'signup', component: SignupComponent, title: 'Sign up - QnA' },
  { path: 'qna', component: QnaComponent, canActivate: [authGuard], title: 'QnA' },
  { path: '**', redirectTo: 'qna' }
];
