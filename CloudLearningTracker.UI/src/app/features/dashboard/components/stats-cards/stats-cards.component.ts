import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { finalize, forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { DashboardProgress } from '../../../../core/models/dashboard-progress';
import { Topic } from '../../../../core/models/topic';
import { SubTopic } from '../../../../core/models/subtopic';
import { TaskModel } from '../../../../core/models/task';
import { Note } from '../../../../core/models/note';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DueTasksComponent } from '../due-tasks/due-tasks.component';
import { ChecklistCardComponent } from '../checklist-card/checklist-card.component';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule, FormsModule,ChecklistCardComponent, ReactiveFormsModule, MatCardModule, DueTasksComponent, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './stats-cards.component.html',
  styleUrl: './stats-cards.component.css',
})
export class StatsCardsComponent implements OnInit {
  progress?: DashboardProgress;
  topics: Topic[] = [];
  selectedTopicId: number | null = null;
  selectedTopic!: Topic;
  subtopics: SubTopic[] = [];
  showTopicModal = false;
  showSubtopicModal = false;
  showSubtopicListModal = false;
  showManageModal = false;
  showAddSubtopicModal = false;
  showTaskFormModal = false;
  showNoteFormModal = false;
  topicForm = { topicId: 0, topicName: '', description: '' };
  subtopicForm = { subTopicId: 0, subTopicName: '', description: '' };
  isSaving = false;
  searchTerm = '';
  subTopicSearechTerm = "";
  filteredSubTopics: SubTopic[] = [];
  filteredTopics: Topic[] = [];
  selectedSubTopicId: number | null = null;
  selectedSubTopic: SubTopic | null = null;
  tasks: TaskModel[] = [];
  notes: Note[] = [];
  taskDraft = { taskTitle: '', description: '', resourceURL: '', dueDate: '' };
  noteDraft = { noteTitle: '', content: '' };
  activeFormSubtopic: SubTopic | null = null;
  checklistItems: ChecklistItem[] = [];
  completedChecklistCount = 0;
  checklistCompleted = false;
  totalTasks = 0;
  totalNotes = 0;
  totalSubtopics = 0;
  private readonly checklistStorageKey = 'cloud-learning-daily-checklist';
  private readonly checklistAchievementStorageKey = 'cloud-learning-daily-achievement';
  private readonly checklistDateStorageKey = 'cloud-learning-daily-checklist-date';

  topicForSubreport: number | null = null;
  private topicFormInitialSnapshot = this.getTopicFormSnapshot();
  private subtopicFormInitialSnapshot = this.getSubtopicFormSnapshot();
  private taskDraftInitialSnapshot = this.getTaskDraftSnapshot();
  private noteDraftInitialSnapshot = this.getNoteDraftSnapshot();

  constructor(
    private dashboardService: DashboardService,
    private cdr: ChangeDetectorRef,
    private refreshService: DashboardRefreshService,
    private toast: ToastService,
    private confirmationService: ConfirmationService
  ) { }

  ngOnInit(): void {
    this.refreshService.onRefresh().subscribe(() => this.loadDashboardData());
    this.loadChecklistState();
    this.loadDashboardData();
  }

  private loadChecklistState(): void {
    const today = new Date().toISOString().split('T')[0];
    const savedDate = this.getStorageValue(this.checklistDateStorageKey);

    if (savedDate && savedDate !== today) {
      this.removeStorageValue(this.checklistStorageKey);
      this.removeStorageValue(this.checklistAchievementStorageKey);
      this.removeStorageValue(this.checklistDateStorageKey);
    }

    const savedItems = this.getStorageValue(this.checklistStorageKey);
    if (savedItems) {
      try {
        this.checklistItems = JSON.parse(savedItems);
      } catch {
        this.checklistItems = this.getDefaultChecklist();
      }
    } else {
      this.checklistItems = this.getDefaultChecklist();
    }

    this.syncChecklistState();
  }

  toggleChecklistItem(index: number): void {
    this.checklistItems[index].checked = !this.checklistItems[index].checked;
    this.saveChecklistState();
  }

  private saveChecklistState(): void {
    this.setStorageValue(this.checklistStorageKey, JSON.stringify(this.checklistItems));
    this.setStorageValue(this.checklistDateStorageKey, new Date().toISOString().split('T')[0]);
    this.syncChecklistState();
  }

  private syncChecklistState(): void {
    this.completedChecklistCount = this.checklistItems.filter((item) => item.checked).length;
    this.checklistCompleted = this.completedChecklistCount === this.checklistItems.length;

    if (this.checklistCompleted) {
      this.setStorageValue(this.checklistAchievementStorageKey, JSON.stringify({
        title: 'Daily Cloud Habit Complete',
        detail: 'You completed your daily cloud learning checklist.',
        tag: 'Completed',
        time: new Date().toISOString(),
      }));
    } else {
      this.removeStorageValue(this.checklistAchievementStorageKey);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('daily-checklist-updated'));
    }
  }

  private getDefaultChecklist(): ChecklistItem[] {
    return [
      { id: 'review', label: 'Review one cloud concept for 10 minutes', checked: false },
      { id: 'notes', label: 'Capture one useful note or takeaway', checked: false },
      { id: 'practice', label: 'Practice one hands-on task or lab step', checked: false },
      { id: 'plan', label: 'Plan the next small learning milestone', checked: false },
    ];
  }

  private getStorageValue(key: string): string | null {
    if (typeof window === 'undefined') {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  private setStorageValue(key: string, value: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, value);
    }
  }

  private removeStorageValue(key: string): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(key);
    }
  }

  private loadDashboardData(): void {
    this.dashboardService.getProgress().subscribe((data) => {
      this.progress = data;
      this.totalTasks = data?.totalTasks ?? 0;
      this.totalSubtopics = data?.totalSubtopics ?? 0;
      this.totalNotes = data?.totalNotes ?? 0;
      this.cdr.detectChanges();
    });
    this.loadTopics();
  }

  loadTopics(): void {
    this.dashboardService.getTopics().subscribe((topics) => {
      this.topics = topics;
      this.filteredTopics = topics;
      if (!this.searchTerm || !this.searchTerm.trim()) {
        this.filteredTopics = [...this.topics];
      } else {
        const searchString = this.searchTerm.toLowerCase().trim();
        this.filteredTopics = this.topics.filter((s) =>
          s.topicName && s.topicName.toLowerCase().includes(searchString)
        );
      }
      this.cdr.detectChanges();
    });
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadTopics();
  }

  selectTopic(topicId: number): void {
    this.selectedTopicId = topicId;
    this.selectedTopic = this.topics.find(t => t.topicId === topicId)!;
    this.selectedSubTopicId = null;
    this.selectedSubTopic = null;
    this.tasks = [];
    this.notes = [];
    this.dashboardService.getSubTopics(topicId).subscribe((subtopics) => {
      this.subtopics = subtopics;
      this.filteredSubTopics = subtopics;
      this.cdr.detectChanges();
    });
  }

  selectSubtopic(subtopic: SubTopic): void {
    const isSameSubtopic = this.selectedSubTopicId === subtopic.subTopicId;

    if (isSameSubtopic) {
      this.selectedSubTopicId = null;
      this.selectedSubTopic = null;
      this.tasks = [];
      this.notes = [];
      this.cdr.detectChanges();
      return;
    }

    this.selectedSubTopicId = subtopic.subTopicId;
    this.selectedSubTopic = subtopic;
    this.dashboardService.getTasksBySubTopic(subtopic.subTopicId).subscribe((tasks) => {
      this.tasks = tasks;
      this.cdr.detectChanges();
    });

    this.dashboardService.getNotesBySubTopic(subtopic.subTopicId).subscribe((notes) => {
      this.notes = notes;
      this.cdr.detectChanges();
    });
  }
loadSubTopics(): void {
  // 1. Guard check: If search term is empty or undefined, return all subtopics immediately
  if (!this.subTopicSearechTerm || !this.subTopicSearechTerm.trim()) {
    this.filteredSubTopics = [...this.subtopics];
  } else {
    // 2. Safe lowercase normalization for case-insensitive filtering
    const searchString = this.subTopicSearechTerm.toLowerCase().trim();
    
    this.filteredSubTopics = this.subtopics.filter(s => 
      s.subTopicName && s.subTopicName.toLowerCase().includes(searchString)
    );
  }

  // 3. Inform Angular to run change detection
  this.cdr.detectChanges();
}

clearSubTopicSearch(){
  this.subTopicSearechTerm = '';
  this.loadSubTopics();
}
  openManageModal(): void {
    this.showManageModal = true;
  }

  private getTopicFormSnapshot() {
    return {
      topicId: this.topicForm.topicId,
      topicName: this.topicForm.topicName?.trim() ?? '',
      description: this.topicForm.description?.trim() ?? '',
    };
  }

  private getSubtopicFormSnapshot() {
    return {
      subTopicId: this.subtopicForm.subTopicId,
      subTopicName: this.subtopicForm.subTopicName?.trim() ?? '',
      description: this.subtopicForm.description?.trim() ?? '',
    };
  }

  private getTaskDraftSnapshot() {
    return {
      taskTitle: this.taskDraft.taskTitle?.trim() ?? '',
      description: this.taskDraft.description?.trim() ?? '',
      resourceURL: this.taskDraft.resourceURL?.trim() ?? '',
      dueDate: this.taskDraft.dueDate ?? '',
    };
  }

  private validateRequired(value: string | null | undefined, message: string): boolean {
    if (!value?.toString().trim()) {
      this.toast.error(message);
      return false;
    }
    return true;
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

  private getNoteDraftSnapshot() {
    return {
      noteTitle: this.noteDraft.noteTitle?.trim() ?? '',
      content: this.noteDraft.content?.trim() ?? '',
    };
  }

  private hasChanges(current: unknown, initial: unknown): boolean {
    return JSON.stringify(current) !== JSON.stringify(initial);
  }

  private confirmDiscardChanges(onConfirm: () => void): void {
    this.confirmationService.confirm({
      title: 'Discard changes?',
      message: 'You have unsaved changes in this form. Do you want to close it and lose them?',
      confirmText: 'Discard',
      cancelText: 'Keep editing',
    }).subscribe((confirmed) => {
      if (confirmed) {
        onConfirm();
        this.cdr.detectChanges();
      }
    });
  }

  private finalizeTaskFormClose(): void {
    this.showTaskFormModal = false;
    this.taskDraft = { taskTitle: '', description: '', resourceURL: '', dueDate: '' };
    this.cdr.detectChanges();
  }

  private finalizeNoteFormClose(): void {
    this.showNoteFormModal = false;
    this.noteDraft = { noteTitle: '', content: '' };
    this.cdr.detectChanges();
  }

  private finalizeItemFormClose(): void {
    this.showTaskFormModal = false;
    this.showNoteFormModal = false;
    this.activeFormSubtopic = null;
    this.taskDraft = { taskTitle: '', description: '', resourceURL: '', dueDate: '' };
    this.noteDraft = { noteTitle: '', content: '' };
    this.showSubtopicListModal = true;
    this.cdr.detectChanges();
  }

   closeTopicModal(): void {
    if (this.showTopicModal && this.hasChanges(this.getTopicFormSnapshot(), this.topicFormInitialSnapshot)) {
      this.confirmDiscardChanges(() => {
        this.showTopicModal = false;
      });
      return;
    }

    this.showTopicModal = false;
  }

   closeSubtopicModal(): void {
    if (this.showSubtopicModal && this.hasChanges(this.getSubtopicFormSnapshot(), this.subtopicFormInitialSnapshot)) {
      this.confirmDiscardChanges(() => {
        this.showSubtopicModal = false;
      });
      return;
    }

    this.showSubtopicModal = false;
  }

   closeAddSubtopicModal(): void {
    if (this.showAddSubtopicModal && this.hasChanges(this.getSubtopicFormSnapshot(), this.subtopicFormInitialSnapshot)) {
      this.confirmDiscardChanges(() => {
        this.showAddSubtopicModal = false;
      });
      return;
    }

    this.showAddSubtopicModal = false;
  }

   closeTaskFormModal(): void {
    if (this.showTaskFormModal && this.hasChanges(this.getTaskDraftSnapshot(), this.taskDraftInitialSnapshot)) {
      this.confirmDiscardChanges(() => {
        this.finalizeTaskFormClose();
      });
      return;
    }

    this.finalizeTaskFormClose();
  }

   closeNoteFormModal(): void {
    if (this.showNoteFormModal && this.hasChanges(this.getNoteDraftSnapshot(), this.noteDraftInitialSnapshot)) {
      this.confirmDiscardChanges(() => {
        this.finalizeNoteFormClose();
      });
      return;
    }

    this.finalizeNoteFormClose();
  }

   closeAllStatsModals(): void {
    if (this.showTopicModal) {
      this.closeTopicModal();
      return;
    }

    if (this.showSubtopicModal) {
      this.closeSubtopicModal();
      return;
    }

    if (this.showAddSubtopicModal) {
      this.closeAddSubtopicModal();
      return;
    }

    if (this.showTaskFormModal) {
      this.closeTaskFormModal();
      return;
    }

    if (this.showNoteFormModal) {
      this.closeNoteFormModal();
      return;
    }

    this.showManageModal = false;
    this.showSubtopicListModal = false;
  }

  openTopicModal(topic?: Topic): void {
    if (topic) {
      this.topicForm = { topicId: topic.topicId, topicName: topic.topicName, description: topic.description ?? '' };
    } else {
      this.topicForm = { topicId: 0, topicName: '', description: '' };
    }
    this.topicFormInitialSnapshot = this.getTopicFormSnapshot();
    this.showTopicModal = true;
  }

  saveTopic(): void {
    if (!this.validateRequired(this.topicForm.topicName, 'Topic name is required.')) {
      return;
    }
    this.isSaving = true;
    const payload = { topicName: this.topicForm.topicName, description: this.topicForm.description };
    const request: Observable<unknown> = this.topicForm.topicId
      ? this.dashboardService.updateTopic(this.topicForm.topicId, payload) as Observable<unknown>
      : this.dashboardService.createTopic(payload) as Observable<unknown>;

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.loadTopics();
        this.refreshService.triggerRefresh();
        this.showTopicModal = false;
        this.toast.success(this.topicForm.topicId ? 'Topic updated.' : 'Topic created.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Unable to save topic right now.'),
    });
  }

  deleteTopic(topicId: number): void {
    const target = this.topics.find((topic) => topic.topicId === topicId);
    const message = target?.description
      ? 'This topic has related subtopics. Delete it and its subtopics as well?'
      : 'Delete this topic and its subtopics?';

    this.confirmationService.confirmDelete(message).subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isSaving = true;
      this.dashboardService.deleteTopic(topicId).pipe(finalize(() => (this.isSaving = false))).subscribe({
        next: () => {
          this.loadTopics();
          this.refreshService.triggerRefresh();
          this.toast.success('Topic deleted.');
          this.cdr.detectChanges();
        },
        error: () => this.toast.error('Unable to delete topic.'),
      });
    });
  }

  openSubtopicModal(subtopic?: SubTopic): void {
    if (subtopic) {
      this.subtopicForm = { subTopicId: subtopic.subTopicId, subTopicName: subtopic.subTopicName, description: subtopic.description ?? '' };
    } else {
      this.subtopicForm = { subTopicId: 0, subTopicName: '', description: '' };
    }
    this.subtopicFormInitialSnapshot = this.getSubtopicFormSnapshot();
    this.showSubtopicModal = true;
  }

 openAddSubtopicModal(subtopic?: SubTopic): void {
    if (subtopic) {
      this.subtopicForm = { subTopicId: subtopic.subTopicId, subTopicName: subtopic.subTopicName, description: subtopic.description ?? '' };
    } else {
      this.subtopicForm = { subTopicId: 0, subTopicName: '', description: '' };
    }
    this.subtopicFormInitialSnapshot = this.getSubtopicFormSnapshot();
    this.showAddSubtopicModal = true;
  }
  saveSubtopic(): void {
    if (!this.validateRequired(this.subtopicForm.subTopicName, 'Subtopic name is required.')) {
      return;
    }

    const selectedTopicId = this.topicForSubreport ?? this.selectedTopicId;
    if (!selectedTopicId) {
      this.toast.error('Select a topic before saving a subtopic.');
      return;
    }

    this.isSaving = true;
    const payload = { topicId: selectedTopicId, subTopicName: this.subtopicForm.subTopicName, description: this.subtopicForm.description };
    const request: Observable<unknown> = this.subtopicForm.subTopicId
      ? this.dashboardService.updateSubTopic(this.subtopicForm.subTopicId, payload) as Observable<unknown>
      : this.dashboardService.createSubTopic(payload) as Observable<unknown>;

    request.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        if (this.selectedTopicId) {
          this.selectTopic(this.selectedTopicId);
        }
        this.refreshService.triggerRefresh();
        this.showSubtopicModal = false;
        this.showAddSubtopicModal = false;
        this.topicForSubreport =  null;
        this.toast.success(this.subtopicForm.subTopicId ? 'Subtopic updated.' : 'Subtopic created.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Unable to save subtopic right now.'),
    });
  }

  deleteSubtopic(subTopicId: number): void {
    this.confirmationService.confirmDelete('Delete this subtopic and its task/note content?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.isSaving = true;
      this.dashboardService.deleteSubTopic(subTopicId).pipe(finalize(() => (this.isSaving = false))).subscribe({
        next: () => {
          if (this.selectedTopicId) {
            this.selectTopic(this.selectedTopicId);
          }
          this.refreshService.triggerRefresh();
          this.toast.success('Subtopic deleted.');
          this.cdr.detectChanges();
        },
        error: () => this.toast.error('Unable to delete subtopic.'),
      });
    });
  }

  openItemForm(subtopic: SubTopic, mode: 'task' | 'note'): void {
    this.showSubtopicListModal = false;
    this.showManageModal = false;
    this.activeFormSubtopic = subtopic;

    if (mode === 'task') {
      this.taskDraft = { taskTitle: '', description: '', resourceURL: '', dueDate: '' };
      this.taskDraftInitialSnapshot = this.getTaskDraftSnapshot();
      this.showTaskFormModal = true;
      this.showNoteFormModal = false;
    } else {
      this.noteDraft = { noteTitle: '', content: '' };
      this.noteDraftInitialSnapshot = this.getNoteDraftSnapshot();
      this.showTaskFormModal = false;
      this.showNoteFormModal = true;
    }
  }

  cancelItemForm(): void {
    const hasTaskChanges = this.showTaskFormModal && this.hasChanges(this.getTaskDraftSnapshot(), this.taskDraftInitialSnapshot);
    const hasNoteChanges = this.showNoteFormModal && this.hasChanges(this.getNoteDraftSnapshot(), this.noteDraftInitialSnapshot);

    if (hasTaskChanges || hasNoteChanges) {
      this.confirmDiscardChanges(() => {
        this.finalizeItemFormClose();
      });
      return;
    }

    this.finalizeItemFormClose();
  }

  saveTaskFromForm(): void {
    if (!this.activeFormSubtopic) {
      this.toast.error('Select a subtopic first.');
      return;
    }

    if (!this.validateRequired(this.taskDraft.taskTitle, 'Task title is required.')) {
      return;
    }

    if (!this.validateOptionalUrl(this.taskDraft.resourceURL)) {
      return;
    }

    this.isSaving = true;
    const payload = {
      subTopicId: this.activeFormSubtopic.subTopicId,
      taskTitle: this.taskDraft.taskTitle.trim(),
      description: this.taskDraft.description.trim() || undefined,
      resourceURL: this.taskDraft.resourceURL.trim() || undefined,
      dueDate: this.taskDraft.dueDate || null,
    };

    this.dashboardService.createTask(payload).pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.loadSubtopicDetails(this.activeFormSubtopic!);
        this.showTaskFormModal = false;
        this.activeFormSubtopic = null;
        this.toast.success('Task created.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Unable to save task right now.'),
    });
  }

  saveNoteFromForm(): void {
    if (!this.activeFormSubtopic) {
      this.toast.error('Select a subtopic first.');
      return;
    }

    if (!this.validateRequired(this.noteDraft.noteTitle, 'Note title is required.')) {
      return;
    }

    if (!this.validateRequired(this.noteDraft.content, 'Note content is required.')) {
      return;
    }

    this.isSaving = true;
    const payload = {
      subTopicId: this.activeFormSubtopic.subTopicId,
      noteTitle: this.noteDraft.noteTitle.trim(),
      content: this.noteDraft.content.trim() || undefined,
    };

    this.dashboardService.createNote(payload).pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.loadSubtopicDetails(this.activeFormSubtopic!);
        this.showNoteFormModal = false;
        this.activeFormSubtopic = null;
        this.toast.success('Note created.');
        this.cdr.detectChanges();
      },
      error: () => this.toast.error('Unable to save note right now.'),
    });
  }

  private loadSubtopicDetails(subtopic: SubTopic): void {
    this.selectedSubTopicId = subtopic.subTopicId;
    this.selectedSubTopic = subtopic;
    this.dashboardService.getTasksBySubTopic(subtopic.subTopicId).subscribe((tasks) => {
      this.tasks = tasks;
      this.cdr.detectChanges();
    });

    this.dashboardService.getNotesBySubTopic(subtopic.subTopicId).subscribe((notes) => {
      this.notes = notes;
      this.cdr.detectChanges();
    });
  }

}
