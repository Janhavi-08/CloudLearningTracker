import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { ChangeDetectorRef } from '@angular/core';
import { DashboardService } from '../../../core/services/dashboard.service';
import { StatsCardsComponent } from '../components/stats-cards/stats-cards.component';
import { DueTasksComponent } from '../components/due-tasks/due-tasks.component';
import { TopicProgressComponent } from '../components/topic-progress/topic-progress.component';
import { KanbanBoardComponent } from '../components/kanban-board/kanban-board.component';
import { CurrentFocusComponent } from '../components/current-focus/current-focus.component';
import { RecentActivityComponent } from '../components/recent-activity/recent-activity.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, StatsCardsComponent, RecentActivityComponent, TopicProgressComponent, KanbanBoardComponent, CurrentFocusComponent, RecentActivityComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  selectedTopicName: string | null = null;
  today = new Date();

  constructor(
    private dashboardService: DashboardService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.dashboardService.getProgress().subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
