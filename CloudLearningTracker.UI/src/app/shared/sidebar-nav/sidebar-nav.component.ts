import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar-nav.component.html',
  styleUrl: './sidebar-nav.component.css'
})
export class SidebarNavComponent {
  @Input() isOpen = false;
  @Input() username = 'Learner';

  @Output() closed = new EventEmitter<void>();
  @Output() logoutRequested = new EventEmitter<void>();

  close(): void {
    this.closed.emit();
  }

  logout(): void {
    this.logoutRequested.emit();
  }
}
