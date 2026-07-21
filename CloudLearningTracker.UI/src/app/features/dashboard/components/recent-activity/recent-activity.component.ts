import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';

interface ActivityItem {
  title: string;
  detail: string;
  time: string;
  tag: string;
}

interface ProgressStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  completionPercentage: number;
  remainingTasks: number;
}

interface AchievementItem {
  title: string;
  detail: string;
  tag: string;
}

@Component({
  selector: 'app-recent-activity',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './recent-activity.component.html',
  styleUrl: './recent-activity.component.css',
})
export class RecentActivityComponent implements OnInit {
  activities: ActivityItem[] = [];
  progressStats: ProgressStats = {
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    completionPercentage: 0,
    remainingTasks: 0,
  };
  motivationText = 'Pick one task to start your day with confidence.';
  achievements: AchievementItem[] = [];

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef, private refreshService: DashboardRefreshService) {}

  ngOnInit(): void {
    this.refreshService.onRefresh().subscribe(() => {
      this.loadActivities();
      this.loadProgress();
    });
    this.loadActivities();
    this.loadProgress();
  }

  private loadActivities(): void {
    this.dashboardService.getRecentActivity().subscribe((data) => {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      this.activities = data
        .map((item) => ({
          title: item.title,
          detail: item.detail,
          time: item.time ?? '',
          tag: item.tag,
        }))
        .filter((item) => this.isSameDay(item.time, startOfToday))
        .sort((a, b) => (a.time > b.time ? -1 : 1));

      this.achievements = this.activities
        .filter((activity) => activity.tag.toLowerCase() === 'completed' || activity.tag.toLowerCase() === 'done')
        .map((activity) => ({
          title: activity.title,
          detail: activity.detail,
          tag: activity.tag,
        }));

      this.cdr.detectChanges();
    });
  }

  private loadProgress(): void {
    this.dashboardService.getProgress().subscribe((data) => {
      this.progressStats = {
        totalTasks: data?.totalTasks ?? 0,
        completedTasks: data?.completedTasks ?? 0,
        inProgressTasks: data?.inProgressTasks ?? 0,
        completionPercentage: data?.completionPercentage ?? 0,
        remainingTasks: Math.max((data?.totalTasks ?? 0) - (data?.completedTasks ?? 0), 0),
      };
      this.motivationText = this.getMotivationText(this.progressStats.completionPercentage);
      this.cdr.detectChanges();
    });
  }

  private getMotivationText(percentage: number): string {
    if (percentage >= 80) {
      return 'You are in a strong rhythm. Keep the streak going.';
    }

    if (percentage >= 50) {
      return 'You are halfway there. One focused session can push you over the line.';
    }

    if (percentage > 0) {
      return 'A quick win today will build real momentum.';
    }

    return 'Pick one task to start your day with confidence.';
  }

  private isSameDay(value: string, startOfToday: Date): boolean {
    if (!value) {
      return false;
    }

    const activityDate = new Date(value);
    if (Number.isNaN(activityDate.getTime())) {
      return false;
    }

    return activityDate >= startOfToday && activityDate < new Date(startOfToday.getTime() + 24 * 60 * 60 * 1000);
  }
}
