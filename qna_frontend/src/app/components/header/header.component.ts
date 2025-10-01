import { Component, EventEmitter, Output, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Observable } from 'rxjs';
import { UserOut } from '../../models/api.models';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  @Output() toggleSidebar = new EventEmitter<void>();
  private auth = inject(AuthService);
  private router = inject(Router);

  user$: Observable<UserOut | null> = this.auth.currentUser$;

  onToggle() {
    this.toggleSidebar.emit();
  }

  logout(evt: any) {
    if (evt && typeof evt.preventDefault === 'function') {
      evt.preventDefault();
    }
    this.auth.logout();
    this.router.navigate(['/login']);
  }
}
