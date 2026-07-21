import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { UpcomingTask } from '../../../../core/models/upcoming-task';
import { DueTask } from '../../../../core/models/due-task';
import { ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs';
@Component({
  selector: 'app-due-tasks',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './due-tasks.component.html',
  styleUrl: './due-tasks.component.css',
})
export class DueTasksComponent implements OnInit {
  upcomingTasks: UpcomingTask[] = [];
  dueTasks: DueTask[] = [];
  isLoading = false;

  get notificationCount(): number {
    return this.upcomingTasks.length + this.dueTasks.length;
  }


  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef, private refreshService: DashboardRefreshService) {}

  ngOnInit(): void {
    this.refreshService.onRefresh().subscribe(() => this.loadTasks());
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;

    this.dashboardService.getUpcomingTasks().pipe(finalize(() => this.isLoading = false)).subscribe((data) => {
      this.upcomingTasks = data ?? [];
      this.cdr.detectChanges();
    });

    this.dashboardService.getDueTasks().subscribe((data) => {
      this.dueTasks = data ?? [];
      this.cdr.detectChanges();
    });
  }
}
