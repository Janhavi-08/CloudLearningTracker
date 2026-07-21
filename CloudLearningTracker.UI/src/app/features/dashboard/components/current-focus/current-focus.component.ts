import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { TaskBoard, TaskItem } from '../../../../core/models/task-board';
import { Topic } from '../../../../core/models/topic';

interface CurrentFocusState {
  topicName: string;
  subTopicName: string;
  completedTasks: number;
  totalTasks: number;
  completionPercentage: number;
  dueDate?: string | null;
  statusLabel: string;
  nextActions: string[];
}

@Component({
  selector: 'app-current-focus',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, MatProgressBarModule],
  templateUrl: './current-focus.component.html',
  styleUrl: './current-focus.component.css',
})
export class CurrentFocusComponent implements OnInit {
  @Input() selectedTopicName: string | null = null;

  focus?: CurrentFocusState;
  topics: Topic[] = [];
  selectedTopicControl: string | null = null;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef, private refreshService: DashboardRefreshService) {}

  ngOnInit(): void {
    this.refreshService.onRefresh().subscribe(() => this.loadBoard());
    this.loadTopics();
    this.loadBoard();
  }

  loadTopics(): void {
    this.dashboardService.getTopics().subscribe((topics) => {
      this.topics = topics ?? [];
      if (this.selectedTopicName) {
        this.selectedTopicControl = this.selectedTopicName;
      } else if (!this.selectedTopicControl && this.topics.length) {
        this.selectedTopicControl = this.topics[0].topicName;
      }
      if (!this.selectedTopicName && this.selectedTopicControl) {
        this.selectedTopicName = this.selectedTopicControl;
      }
      this.loadBoard();
      this.cdr.detectChanges();
    });
  }

  onTopicChange(): void {
    this.selectedTopicName = this.selectedTopicControl;
    this.loadBoard();
  }

  private loadBoard(): void {
    this.dashboardService.getBoard().subscribe((board) => {
      this.buildFocus(this.normalizeBoard(board));
      this.cdr.detectChanges();
    });
  }

  private normalizeBoard(board: Partial<TaskBoard> | any): TaskBoard {
    return {
      notStarted: (board?.notStarted ?? board?.NotStarted ?? []).map((task: TaskItem) => ({ ...task })),
      inProgress: (board?.inProgress ?? board?.InProgress ?? []).map((task: TaskItem) => ({ ...task })),
      completed: (board?.completed ?? board?.Completed ?? []).map((task: TaskItem) => ({ ...task })),
    };
  }

  private buildFocus(board: TaskBoard): void {
    const tasks = [...board.notStarted, ...board.inProgress, ...board.completed];

    const filteredTasks = this.selectedTopicName
      ? tasks.filter((task) => task.topicName === this.selectedTopicName)
      : tasks;

    const nextTask = filteredTasks
      .filter((task) => task.taskStatusId !== 3)
      .sort((left, right) => (left.dueDate ?? '').localeCompare(right.dueDate ?? ''))[0] ?? filteredTasks[0] ?? tasks[0];

    if (!nextTask) {
      this.focus = undefined;
      return;
    }

    const topicTasks = filteredTasks.filter((task) => task.topicName === nextTask.topicName);
    const completedTasks = topicTasks.filter((task) => task.taskStatusId === 3).length;
    const totalTasks = topicTasks.length;
    const remaining = topicTasks.filter((task) => task.taskStatusId !== 3);

    this.focus = {
      topicName: nextTask.topicName,
      subTopicName: nextTask.subTopicName,
      completedTasks,
      totalTasks,
      completionPercentage: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
      dueDate: nextTask.dueDate,
      statusLabel: nextTask.taskStatus,
      nextActions: remaining.slice(0, 3).map((task) => task.taskTitle),
    };
  }
}
