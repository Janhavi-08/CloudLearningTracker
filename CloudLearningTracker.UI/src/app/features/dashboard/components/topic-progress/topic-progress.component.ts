import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { TopicProgressItem, TopicProgressSubItem } from '../../../../core/models/topic-progress-item';
import { TaskBoard, TaskItem } from '../../../../core/models/task-board';
import { forkJoin, map, catchError, of } from 'rxjs';

@Component({
  selector: 'app-topic-progress',
  standalone: true,
  imports: [CommonModule, FormsModule, MatProgressBarModule],
  templateUrl: './topic-progress.component.html',
  styleUrl: './topic-progress.component.css',
})
export class TopicProgressComponent implements OnInit {
  @Output() topicSelected = new EventEmitter<string>();

  topics: TopicProgressItem[] = [];
  selectedTopicName: string | null = null;
  expandedTopicName: string | null = null;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef, private refreshService: DashboardRefreshService) {}

  ngOnInit(): void {
    this.refreshService.onRefresh().subscribe(() => this.loadData());
    this.loadData();
  }

  private loadData(): void {
    this.dashboardService.getTopicProgress().subscribe((data) => {
      this.topics = (data ?? []).map((item) => ({ ...item, subTopics: [] }));
      this.loadSubTopicProgress();
      if (!this.selectedTopicName && this.topics.length) {
        this.selectTopic(this.topics[0].topicName);
      }
      this.cdr.detectChanges();
    });
  }
  
private loadSubTopicProgress(): void {
  // 1. Fetch the board tasks and the subtopics structure
  forkJoin({
    board: this.dashboardService.getBoard(),
    // Assuming you have a way to get all subtopics, or you can map from your existing topics array
    // If you don't have getSubTopics here, we will fetch them per topic below
  }).subscribe(({ board }) => {
    const normalizedBoard = this.normalizeBoard(board);
    const tasks = [...normalizedBoard.notStarted, ...normalizedBoard.inProgress, ...normalizedBoard.completed];

    // Create an array of requests to fetch actual subtopics for every single topic
    const subTopicRequests = this.topics.map((topic) =>
      this.dashboardService.getSubTopics(topic.topicId).pipe(
        map((backendSubTopics) => ({
          topicId: topic.topicId,
          backendSubTopics: backendSubTopics ?? []
        })),
        catchError(() => of({ topicId: topic.topicId, backendSubTopics: [] }))
      )
    );

    // Resolve all subtopic lists from the server
    forkJoin(subTopicRequests).subscribe((allTopicSubTopics) => {
      this.topics = this.topics.map((topic) => {
        // Find the fetched subtopics for this specific topic
        const matchedData = allTopicSubTopics.find(t => t.topicId === topic.topicId);
        const masterSubTopics = matchedData ? matchedData.backendSubTopics : [];

        const topicTasks = tasks.filter((task) => task.topicName === topic.topicName);

        // Map every master subtopic to ensure it always shows up in the grid
        const derivedSubTopics = masterSubTopics.map((sub) => {
          // Filter tasks belonging strictly to this subtopic
          const subTopicTasks = topicTasks.filter(task => task.subTopicName === sub.subTopicName);
          
          const totalTasks = subTopicTasks.length;
          const completedTasks = subTopicTasks.filter(task => task.taskStatusId === 3).length;

          return {
            subTopicName: sub.subTopicName,
            totalTasks: totalTasks,
            completedTasks: completedTasks,
            // FIX: If totalTasks is 0, flag it so the template knows there are no tasks
            hasNoTasks: totalTasks === 0, 
            completionPercentage: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)
          };
        });

        return { ...topic, subTopics: derivedSubTopics };
      });

      // If active selection exists, re-sync your view bindings
      if (this.selectedTopicName) {
        this.selectTopic(this.selectedTopicName);
      }
      this.cdr.detectChanges();
    });
  });
}

  // private loadSubTopicProgress(): void {
  //   this.dashboardService.getBoard().subscribe((board) => {
  //     const normalizedBoard = this.normalizeBoard(board);
  //     const tasks = [...normalizedBoard.notStarted, ...normalizedBoard.inProgress, ...normalizedBoard.completed];

  //     this.topics = this.topics.map((topic) => {
  //       const topicTasks = tasks.filter((task) => task.topicName === topic.topicName);
  //       const subTopics = new Map<string, TopicProgressSubItem>();

  //       topicTasks.forEach((task) => {
  //         const existing = subTopics.get(task.subTopicName) ?? { subTopicName: task.subTopicName, totalTasks: 0, completedTasks: 0, completionPercentage: 0 };
  //         existing.totalTasks += 1;
  //         if (task.taskStatusId === 3) {
  //           existing.completedTasks += 1;
  //         }
  //         subTopics.set(task.subTopicName, existing);
  //       });

  //       const derivedSubTopics = Array.from(subTopics.values()).map((subTopic) => ({
  //         ...subTopic,
  //         completionPercentage: subTopic.totalTasks === 0 ? 0 : Math.round((subTopic.completedTasks / subTopic.totalTasks) * 100),
  //       }));

  //       return { ...topic, subTopics: derivedSubTopics };
  //     });

  //     this.cdr.detectChanges();
  //   });
  // }

  private normalizeBoard(board: Partial<TaskBoard> | any): TaskBoard {
    return {
      notStarted: (board?.notStarted ?? board?.NotStarted ?? []).map((task: TaskItem) => ({ ...task })),
      inProgress: (board?.inProgress ?? board?.InProgress ?? []).map((task: TaskItem) => ({ ...task })),
      completed: (board?.completed ?? board?.Completed ?? []).map((task: TaskItem) => ({ ...task })),
    };
  }

  selectTopic(topicName: string): void {
    this.selectedTopicName = topicName;
    this.expandedTopicName = this.expandedTopicName === topicName ? null : topicName;
    this.topicSelected.emit(topicName);
  }
}
