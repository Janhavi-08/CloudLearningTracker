import { ChangeDetectorRef, Component, HostListener, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { finalize } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { ToastService } from '../../../../core/services/toast.service';
import { TaskBoard, TaskItem } from '../../../../core/models/task-board';
import { SubTopic } from '../../../../core/models/subtopic';
import { DashboardProgress } from '../../../../core/models/dashboard-progress';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

type ColumnKey = 'notStarted' | 'inProgress' | 'completed';

@Component({
  selector: 'app-kanban-board',
  standalone: true,
  imports: [CommonModule, DragDropModule, DatePipe, FormsModule],
  templateUrl: './kanban-board.component.html',
  styleUrl: './kanban-board.component.css',
})
export class KanbanBoardComponent implements OnInit {
  board: TaskBoard = { notStarted: [], inProgress: [], completed: [] };
  columns = [
    { key: 'notStarted', title: 'Not Started' },
    { key: 'inProgress', title: 'In Progress' },
    { key: 'completed', title: 'Completed' },
  ] as const;
  selectedTask?: TaskItem;
  showTaskModal = false;
  showCreateModal = false;
  isSaving = false;
  taskForm = { taskId: 0, taskTitle: '', description: '', resourceURL: '', dueDate: '', subTopicId: null as number | null };
  subtopics: SubTopic[] = [];
  topics: Array<{ topicId: number; topicName: string }> = [];
  showDeleteModal = false;
  showFilterMenu = false;
  searchTerm = '';
  selectedTopicFilter: number | null = null;
  selectedSubtopicFilter: number | null = null;
  tempTopicFilter: number | null = null;
  tempSubtopicFilter: number | null = null;
  sortDirections: Record<ColumnKey, 'asc' | 'desc'> = {
    notStarted: 'asc',
    inProgress: 'asc',
    completed: 'asc',
  };
  taskToDeleteId: number | null = null;
  progress?: DashboardProgress;
  isProgressMenuOpen = false;
  private taskFormInitialSnapshot = this.getTaskFormSnapshot();
inputType: 'text' | 'date' = 'text'; 

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private refreshService: DashboardRefreshService,
    private toast: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.refreshService.onRefresh().subscribe(() => this.loadDashboardData());
    this.loadDashboardData();
    this.loadBoard();
    this.loadSubtopics();
  }
  
  onFocus() {
    this.inputType = 'date';
  }

  onBlur() {
    // If no date was picked, turn it back into a text box to show placeholder
    if (!this.taskForm.dueDate) {
      this.inputType = 'text';
    }
  }
  private loadDashboardData(): void {
    this.dashboardService.getProgress().subscribe((data) => {
      this.progress = data;
      this.cdr.detectChanges();
    });
  }

  // 1. Toggles open/close state when clicking the progress label row
  toggleProgressMenu(event: Event): void {
    event.stopPropagation(); // Stops immediate execution bubbling loops
    this.isProgressMenuOpen = !this.isProgressMenuOpen;
    this.cdr.detectChanges();
  }

  // 2. Closes the open menu window instantly if user clicks anywhere outside it
  @HostListener('document:click')
  closeProgressMenu(): void {
    if (this.isProgressMenuOpen) {
      this.isProgressMenuOpen = false;
      this.cdr.detectChanges();
    }
  }

  getPercentage(): number {
    if (!this.progress || !this.progress.totalTasks) return 0;
    return Math.round((this.progress.completedTasks / this.progress.totalTasks) * 100);
  }
  
  loadBoard(): void {
    this.dashboardService.getBoard().subscribe((data) => {
      this.board = this.mapBoard(data);
      this.cdr.detectChanges();
    });
  }

  loadSubtopics(): void {
    this.dashboardService.getTopics().subscribe((topics) => {
      this.topics = topics;
      const allSubtopics: SubTopic[] = [];
      topics.forEach((topic) => {
        this.dashboardService.getSubTopics(topic.topicId).subscribe((subtopics) => {
          allSubtopics.push(...subtopics);
          this.subtopics = allSubtopics;
          this.cdr.detectChanges();
        });
      });
    });
  }

  toggleFilterMenu(event?: Event): void {
    event?.stopPropagation();
    if (!this.showFilterMenu) {
      this.tempTopicFilter = this.selectedTopicFilter;
      this.tempSubtopicFilter = this.selectedSubtopicFilter;
    }
    this.showFilterMenu = !this.showFilterMenu;
  }

  applyFilters(): void {
    this.selectedTopicFilter = this.tempTopicFilter;
    this.selectedSubtopicFilter = this.tempSubtopicFilter;
    console.log(this.selectedSubtopicFilter,'adfasfasfdasdfasdfasdf');
    this.showFilterMenu = false;
    this.cdr.detectChanges();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedTopicFilter = null;
    this.selectedSubtopicFilter = null;
    this.tempTopicFilter = null;
    this.tempSubtopicFilter = null;
    this.showFilterMenu = false;
    this.cdr.detectChanges();
  }

  onTopicFilterChange(): void {
    this.tempSubtopicFilter = null;
  }

  getVisibleSubtopics(): SubTopic[] {
    const activeTopicFilter = this.tempTopicFilter ?? this.selectedTopicFilter;

    if (!activeTopicFilter) {
      return this.subtopics;
    }

    return this.subtopics.filter((subtopic) => subtopic.topicId === activeTopicFilter);
  }

  toggleSort(columnKey: ColumnKey): void {
    this.sortDirections[columnKey] = this.sortDirections[columnKey] === 'asc' ? 'desc' : 'asc';
    this.cdr.detectChanges();
  }

  getSortArrow(columnKey: ColumnKey): string {
    return this.sortDirections[columnKey] === 'asc' ? '↑' : '↓';
  }

  getColumnTasks(key: ColumnKey): TaskItem[] {
    const tasks = this.board[key] ?? [];
    const query = this.searchTerm.trim().toLowerCase();

    return tasks
      .filter((task) => {
        const matchesSearch = !query || [task.taskTitle, task.description, task.subTopicName, task.topicName]
          .filter(Boolean)
          .some((value) => (value ?? '').toLowerCase().includes(query));

        const matchesTopic = !this.selectedTopicFilter || this.getTopicIdByName(task.topicName) === this.selectedTopicFilter;
        const matchesSubtopic = !this.selectedSubtopicFilter || this.getSubTopicIdByName(task.subTopicName) === this.selectedSubtopicFilter;

        return matchesSearch && matchesTopic && matchesSubtopic;
      })
      .sort((a, b) => this.compareByDueDate(a, b, this.sortDirections[key]));
  }

  getColumnCount(key: ColumnKey): number {
    return this.getColumnTasks(key).length;
  }

  private compareByDueDate(a: TaskItem, b: TaskItem, direction: 'asc' | 'desc'): number {
    const aValue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const bValue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

    if (aValue === bValue) {
      return a.taskTitle.localeCompare(b.taskTitle);
    }

    return direction === 'asc' ? aValue - bValue : bValue - aValue;
  }

  private getTopicIdByName(topicName: string): number | null {
    return this.topics.find((topic) => topic.topicName === topicName)?.topicId ?? null;
  }
    private getSubTopicIdByName(subTopicName: string): number | null {
    return this.subtopics.find((sub) => sub.subTopicName === subTopicName)?.subTopicId ?? null;
  }

  openTask(task: TaskItem): void {
    this.selectedTask = task;
    this.showTaskModal = true;
  }

  openCreateModal(selectedTask?: TaskItem): void {
    if (selectedTask) {
      const matchedSubtopicId = this.findSubtopicIdForTask(selectedTask);
      selectedTask.dueDate = selectedTask.dueDate ? selectedTask.dueDate.split('T')[0] : ''; 

      this.taskForm = {
        taskId: selectedTask.taskId,
        taskTitle: selectedTask.taskTitle,
        description: selectedTask.description,
        resourceURL: selectedTask.resourceURL || '',
        dueDate: selectedTask.dueDate || '',
        subTopicId: matchedSubtopicId,
      };
      
      this.inputType = this.taskForm.dueDate ? 'date' : 'text';

    } else {
      this.taskForm = { taskId: 0, taskTitle: '', description: '', resourceURL: '', dueDate: '', subTopicId: null };
    }
    this.taskFormInitialSnapshot = this.getTaskFormSnapshot();
    this.showCreateModal = true;
  }

  private validateOptionalUrl(value: string | null | undefined): boolean {
    if (!value?.toString().trim()) {
      return true;
    }

    try {
      new URL(value);
      return true;
    } catch {
      this.toast.error('Please enter a valid URL.');
      return false;
    }
  }

  saveTask(): void {
    const cleanedTitle = this.taskForm.taskTitle?.trim();
    if (!cleanedTitle || !this.taskForm.subTopicId) {
      this.toast.error('Task title and subtopic are required.');
      return;
    }

    if (!this.validateOptionalUrl(this.taskForm.resourceURL)) {
      return;
    }

    this.isSaving = true;
    const payload = {
      subTopicId: this.taskForm.subTopicId,
      taskTitle: cleanedTitle,
      description: this.taskForm.description,
      resourceURL: this.taskForm.resourceURL,
      dueDate: this.taskForm.dueDate || null,
    };

    this.dashboardService.createTask(payload).pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.loadBoard();
        this.refreshService.triggerRefresh();
        this.showCreateModal = false;
        this.showTaskModal = this.selectedTask ? true : false;
        this.toast.success('Task created.');
      },
      error: () => {
        this.toast.error('Unable to create task.');
      }
    });
  }
  cancel(): void {
    if (this.hasTaskFormChanges()) {
      this.confirmationService.confirm({
        title: 'Discard changes?',
        message: 'You have unsaved changes in this task form. Do you want to close it and lose them?',
        confirmText: 'Discard',
        cancelText: 'Keep editing',
      }).subscribe((confirmed) => {
        if (confirmed) {
          this.resetFormAndClose();
        }
      });
      return;
    }

    this.resetFormAndClose();
  }

  private resetFormAndClose(): void {
    this.showCreateModal = false;
    this.showTaskModal = this.selectedTask ? true : false;
    this.taskForm = { taskId: 0, taskTitle: '', description: '', resourceURL: '', dueDate: '', subTopicId: null as number | null };
    this.taskFormInitialSnapshot = this.getTaskFormSnapshot();
  }

  private getTaskFormSnapshot() {
    return {
      taskId: this.taskForm.taskId,
      taskTitle: this.taskForm.taskTitle?.trim() ?? '',
      description: this.taskForm.description?.trim() ?? '',
      resourceURL: this.taskForm.resourceURL?.trim() ?? '',
      dueDate: this.taskForm.dueDate ?? '',
      subTopicId: this.taskForm.subTopicId ?? null,
    };
  }

  private hasTaskFormChanges(): boolean {
    return JSON.stringify(this.getTaskFormSnapshot()) !== JSON.stringify(this.taskFormInitialSnapshot);
  }

  private findSubtopicIdForTask(task: TaskItem): number | null {
    if (task.subTopicId) {
      return Number(task.subTopicId);
    }

    const matchedSubtopic = this.subtopics.find((subtopic) => subtopic.subTopicName === task.subTopicName);
    return matchedSubtopic?.subTopicId ?? null;
  }

  confirmDeleteTask(taskId: number): void {
        
     if (taskId === null) {
        return;
      }
    this.confirmationService.confirmDelete("Are you sure you? This action cannot be undone.").subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }
  
      this.isSaving = true;
      this.dashboardService.deleteTask(taskId).pipe(finalize(() => (this.isSaving = false))).subscribe({
        next: () => {
          this.loadBoard();
          this.refreshService.triggerRefresh();
          this.showTaskModal = false;
          this.selectedTask =undefined
          this.toast.success('Task deleted.');
        },
        error: () => this.toast.error('Unable to delete task.'),
      });
    });
  }

  updateTaskStatus(task: TaskItem, statusId: number): void {
    this.isSaving = true;
    this.dashboardService.updateTaskStatus(task.taskId, statusId).pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.loadBoard();
        this.refreshService.triggerRefresh();
      },
      error: () => this.toast.error('Unable to update task status.'),
    });
  }

  getStatusActionLabel(task?: TaskItem): string {
    if (!task) {
      return 'Update Status';
    }

    if (task.taskStatusId === 1) {
      return 'Move to In Progress';
    }

    if (task.taskStatusId === 2) {
      return 'Mark Complete';
    }

    return 'Completed';
  }

  advanceTaskStatus(task?: TaskItem): void {
    if (!task || task.taskStatusId === 3) {
      return;
    }

    const nextStatusId = task.taskStatusId === 1 ? 2 : 3;
    this.updateTaskStatus(task, nextStatusId);
    this.showTaskModal = false;
    this.selectedTask = undefined;
  }

  drop(event: CdkDragDrop<TaskItem[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      return;
    }

    transferArrayItem(event.previousContainer.data, event.container.data, event.previousIndex, event.currentIndex);

    const task = event.container.data[event.currentIndex];
    const statusMap = { notStarted: 1, inProgress: 2, completed: 3 } as const;
    const newStatus = statusMap[event.container.id as keyof typeof statusMap];

    if (task) {
      this.updateTaskStatus(task, newStatus);
    }
  }

  getTopicProgressLabel(task: TaskItem): string {
    const topicTasks = [...this.board.notStarted, ...this.board.inProgress, ...this.board.completed].filter((item) => item.topicName === task.topicName);
    const completed = topicTasks.filter((item) => item.taskStatusId === 3).length;
    const total = topicTasks.length;

    return total > 0 ? `${completed}/${total} completed` : '0/0 completed';
  }

  private mapBoard(data: Partial<TaskBoard> | any): TaskBoard {
    return {
      notStarted: (data?.notStarted ?? data?.NotStarted ?? []).map((item: TaskItem) => ({ ...item })),
      inProgress: (data?.inProgress ?? data?.InProgress ?? []).map((item: TaskItem) => ({ ...item })),
      completed: (data?.completed ?? data?.Completed ?? []).map((item: TaskItem) => ({ ...item })),
    };
  }

}
