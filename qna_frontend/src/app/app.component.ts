import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'QnA Frontend';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  // Dispatch a browser event apps can listen to if they want to toggle sidebars.
  onToggleSidebar() {
    if (isPlatformBrowser(this.platformId)) {
      const g: any = globalThis as any;
      if (g && typeof g.dispatchEvent === 'function') {
        // Create a minimal event object compatible with EventListener
        const evt: any = { type: 'globalToggleSidebar' };
        g.dispatchEvent(evt);
      }
    }
  }
}
