import { Component, OnInit, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { Topic } from '../../../../core/models/topic';
import { SubTopic } from '../../../../core/models/subtopic';
import { TaskModel } from '../../../../core/models/task';
import { Note } from '../../../../core/models/note';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './management.component.html',
  styleUrl: './management.component.css',
})
export class ManagementComponent implements OnInit {
  topics: Topic[] = [];
  subtopics: SubTopic[] = [];
  tasks: TaskModel[] = [];
  notes: Note[] = [];

  selectedTopicId: number | null = null;
  selectedSubTopicId: number | null = null;

  // Modal states
  showTopicModal = false;
  showSubTopicModal = false;
  showTaskModal = false;
  showNoteModal = false;

  topicForm = { topicId: 0, topicName: '', description: '' };
  subTopicForm = { subTopicId: 0, subTopicName: '', description: '' };
  taskForm = { taskId: 0, taskTitle: '', description: '', resourceURL: '', dueDate: '' };
  noteForm = { noteId: 0, noteTitle: '', content: '', resourceURL: '' };

  constructor(
    private dashboardService: DashboardService,
    private sanitizer: DomSanitizer,
    private confirmationService: ConfirmationService,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.loadTopics();
  }

  loadTopics(): void {
    this.dashboardService.getTopics().subscribe((topics) => {
      this.topics = topics;
      if (!this.selectedTopicId && topics.length) {
        this.selectTopic(topics[0].topicId);
      }
    });
  }

  selectTopic(topicId: number): void {
    this.selectedTopicId = topicId;
    this.loadSubTopics(topicId);
  }

  loadSubTopics(topicId: number): void {
    this.dashboardService.getSubTopics(topicId).subscribe((subtopics) => {
      this.subtopics = subtopics;
      if (subtopics.length) {
        const selectedExists = this.selectedSubTopicId !== null && subtopics.some((sub) => sub.subTopicId === this.selectedSubTopicId);
        if (selectedExists) {
          this.loadTasksAndNotes(this.selectedSubTopicId!);
        } else {
          this.selectSubTopic(subtopics[0].subTopicId);
        }
      } else {
        this.selectedSubTopicId = null;
        this.tasks = [];
        this.notes = [];
      }
    });
  }

  selectSubTopic(subTopicId: number): void {
    this.selectedSubTopicId = subTopicId;
    this.loadTasksAndNotes(subTopicId);
  }

  loadTasksAndNotes(subTopicId: number): void {
    this.dashboardService.getTasksBySubTopic(subTopicId).subscribe((tasks) => {
      this.tasks = tasks;
    });

    this.dashboardService.getNotesBySubTopic(subTopicId).subscribe((notes) => {
      this.notes = notes;
    });
  }

  getSafeHtml(value?: string | null): SafeHtml {
    const normalized = (value ?? '').replace(/\n/g, '<br>');
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, normalized) ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  // Topic modals
  openTopicModal(topic?: Topic): void {
    if (topic) {
      this.topicForm = { ...topic, description: topic.description ?? '' };
    } else {
      this.topicForm = { topicId: 0, topicName: '', description: '' };
    }
    this.showTopicModal = true;
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

  saveTopic(): void {
    if (!this.validateRequired(this.topicForm.topicName, 'Topic name is required.')) {
      return;
    }

    const payload = { topicName: this.topicForm.topicName, description: this.topicForm.description };

    if (this.topicForm.topicId) {
      this.dashboardService.updateTopic(this.topicForm.topicId, payload).subscribe(() => {
        this.loadTopics();
        this.showTopicModal = false;
      });
    } else {
      this.dashboardService.createTopic(payload).subscribe(() => {
        this.loadTopics();
        this.showTopicModal = false;
      });
    }
  }

  deleteTopic(topicId: number): void {
    this.confirmationService.confirmDelete('Delete this topic and all related content?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.dashboardService.deleteTopic(topicId).subscribe(() => {
        this.loadTopics();
      });
    });
  }

  // SubTopic modals
  openSubTopicModal(subtopic?: SubTopic): void {
    if (subtopic) {
      this.subTopicForm = { ...subtopic, description: subtopic.description ?? '' };
    } else {
      this.subTopicForm = { subTopicId: 0, subTopicName: '', description: '' };
    }
    this.showSubTopicModal = true;
  }

  saveSubTopic(): void {
    if (!this.validateRequired(this.subTopicForm.subTopicName, 'Subtopic name is required.')) {
      return;
    }

    if (!this.selectedTopicId) {
      this.toast.error('Select a topic before saving a subtopic.');
      return;
    }

    const payload = {
      topicId: this.selectedTopicId,
      subTopicName: this.subTopicForm.subTopicName,
      description: this.subTopicForm.description,
    };

    if (this.subTopicForm.subTopicId) {
      this.dashboardService.updateSubTopic(this.subTopicForm.subTopicId, payload).subscribe(() => {
        this.loadSubTopics(this.selectedTopicId!);
        this.showSubTopicModal = false;
      });
    } else {
      this.dashboardService.createSubTopic(payload).subscribe(() => {
        this.loadSubTopics(this.selectedTopicId!);
        this.showSubTopicModal = false;
      });
    }
  }

  deleteSubTopic(subTopicId: number): void {
    this.confirmationService.confirmDelete('Delete this subtopic?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.dashboardService.deleteSubTopic(subTopicId).subscribe(() => {
        this.loadSubTopics(this.selectedTopicId!);
      });
    });
  }

  // Task modals
  openTaskModal(task?: TaskModel): void {
    if (task) {
      this.taskForm = {
        taskId: task.taskId,
        taskTitle: task.taskTitle,
        description: task.description ?? '',
        resourceURL: task.resourceURL ?? '',
        dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      };
    } else {
      this.taskForm = { taskId: 0, taskTitle: '', description: '', resourceURL: '', dueDate: '' };
    }
    this.showTaskModal = true;
  }

  saveTask(): void {
    if (!this.validateRequired(this.taskForm.taskTitle, 'Task title is required.')) {
      return;
    }

    if (!this.selectedSubTopicId) {
      this.toast.error('Select a subtopic before saving a task.');
      return;
    }

    if (!this.validateOptionalUrl(this.taskForm.resourceURL)) {
      return;
    }

    const payload = {
      subTopicId: this.selectedSubTopicId,
      taskTitle: this.taskForm.taskTitle,
      description: this.taskForm.description,
      resourceURL: this.taskForm.resourceURL,
      dueDate: this.taskForm.dueDate || null,
    };

    if (this.taskForm.taskId) {
      this.dashboardService.updateTask(this.taskForm.taskId, payload).subscribe(() => {
        this.loadTasksAndNotes(this.selectedSubTopicId!);
        this.showTaskModal = false;
      });
    } else {
      this.dashboardService.createTask(payload).subscribe(() => {
        this.loadTasksAndNotes(this.selectedSubTopicId!);
        this.showTaskModal = false;
      });
    }
  }

  deleteTask(taskId: number): void {
    this.confirmationService.confirmDelete('Delete this task?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.dashboardService.deleteTask(taskId).subscribe(() => {
        this.loadTasksAndNotes(this.selectedSubTopicId!);
      });
    });
  }

  // Note modals
  openNoteModal(note?: Note): void {
    if (note) {
      this.noteForm = {
        noteId: note.noteId,
        noteTitle: note.noteTitle,
        content: note.content ?? '',
        resourceURL: note.resourceURL ?? '',
      };
    } else {
      this.noteForm = { noteId: 0, noteTitle: '', content: '', resourceURL: '' };
    }
    this.showNoteModal = true;
  }

  saveNote(): void {
    if (!this.validateRequired(this.noteForm.noteTitle, 'Note title is required.')) {
      return;
    }

    if (!this.validateRequired(this.noteForm.content, 'Note content is required.')) {
      return;
    }

    if (!this.selectedSubTopicId) {
      this.toast.error('Select a subtopic before saving a note.');
      return;
    }

    if (!this.validateOptionalUrl(this.noteForm.resourceURL)) {
      return;
    }

    const payload = {
      subTopicId: this.selectedSubTopicId,
      noteTitle: this.noteForm.noteTitle,
      content: this.noteForm.content,
      resourceURL: this.noteForm.resourceURL,
    };

    if (this.noteForm.noteId) {
      this.dashboardService.updateNote(this.noteForm.noteId, payload).subscribe(() => {
        this.loadTasksAndNotes(this.selectedSubTopicId!);
        this.showNoteModal = false;
      });
    } else {
      this.dashboardService.createNote(payload).subscribe(() => {
        this.loadTasksAndNotes(this.selectedSubTopicId!);
        this.showNoteModal = false;
      });
    }
  }

  deleteNote(noteId: number): void {
    this.confirmationService.confirmDelete('Delete this note?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.dashboardService.deleteNote(noteId).subscribe(() => {
        this.loadTasksAndNotes(this.selectedSubTopicId!);
      });
    });
  }
}
