import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionOut } from '../../models/api.models';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  @Input() open = true;
  @Input() questions: QuestionOut[] = [];
  @Input() selectedId: number | null = null;
  @Output() selectQuestion = new EventEmitter<QuestionOut>();

  trackById = (_: number, q: QuestionOut) => q.id;
}
