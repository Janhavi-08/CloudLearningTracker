import { Component, OnInit, SecurityContext } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../core/environments/environment';
import { Note } from '../../../core/models/note';
import { Topic } from '../../../core/models/topic';
import { SubTopic } from '../../../core/models/subtopic';
import { ChangeDetectorRef } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';
import { ConfirmationService } from '../../../core/services/confirmation.service';

@Component({
  selector: 'app-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './notes.component.html',
  styleUrl: './notes.component.css',
})
export class NotesComponent implements OnInit {
  notes: Note[] = [];
  visibleNotes: Note[] = [];
  searchTerm = '';
  topicFilter = '';
  topics: Topic[] = [];
  subTopics: SubTopic[] = [];
  subTopicsAll: SubTopic[] = [];
  topicFilterOptions: Array<{ value: string; label: string; group?: string; isSubtopic?: boolean }> = [];
  noteForm: FormGroup;
  editingNoteId?: number;
  isSubmitting = false;
  showForm = false;
  showViewModal = false;
  selectedViewNote: Note | null = null;

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer,
    private toast: ToastService,
    private confirmationService: ConfirmationService
  ) {
    this.noteForm = this.fb.group({
      noteTitle: ['', Validators.required],
      content: ['', Validators.required],
      topicId: [null, Validators.required],
      subTopicId: [null, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadTopics();
    this.loadNotes();
  }

  getSafeHtml(value?: string | null): SafeHtml {
    const normalized = (value ?? '').replace(/\n/g, '<br>');
    const sanitized = this.sanitizer.sanitize(SecurityContext.HTML, normalized) ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(sanitized);
  }

  loadTopics(): void {
    this.http.get<Topic[]>(`${environment.apiUrl}/Topic`).subscribe((data) => {
      this.topics = data || [];
      this.topicFilterOptions = [];
      if (this.topics.length) {
        const first = this.topics[0];
        if (!this.noteForm.value.topicId) {
          this.noteForm.patchValue({ topicId: first.topicId });
        }
        // load subtopics for first topic
        this.loadSubTopics(first.topicId);

        // also populate all subtopics for name lookups
        this.subTopicsAll = [];
        this.topics.forEach((t) => {
          this.http
            .get<SubTopic[]>(`${environment.apiUrl}/SubTopic?topicId=${t.topicId}`)
            .subscribe((subs) => {
              this.subTopicsAll = this.subTopicsAll.concat(subs || []);
              this.topicFilterOptions.push({ value: `topic-${t.topicId}`, label: t.topicName, group: 'Topics' });
              (subs || []).forEach((sub) => {
                this.topicFilterOptions.push({ value: `subtopic-${sub.subTopicId}`, label: `↳ ${sub.subTopicName}`, group: t.topicName, isSubtopic: true });
              });
              this.loadNotes();
            }, () => { }, () => {
              // after collecting subtopics, ensure notes are loaded (helps initial render)
              // keep idempotent
              this.loadNotes();
            });
        });
      }
    });
  }

  loadSubTopics(topicId: number): void {
    this.http.get<SubTopic[]>(`${environment.apiUrl}/SubTopic?topicId=${topicId}`).subscribe((data) => {
      this.subTopics = data || [];
      if (this.subTopics.length && !this.noteForm.value.subTopicId) {
        this.noteForm.patchValue({ subTopicId: this.subTopics[0].subTopicId });
      }
    });
  }

  loadNotes(): void {

    const keyword = this.searchTerm.trim();
    const url = keyword
      ? `${environment.apiUrl}/Notes/search?keyword=${encodeURIComponent(keyword)}`
      : `${environment.apiUrl}/Notes`;

    this.http.get<Note[]>(url).subscribe({
      next: (data) => {
        this.notes = data || [];
        this.visibleNotes = [...this.getVisibleNotes()];
        this.cdr.detectChanges();
      },
      error: () => {
        this.notes = [];
        this.visibleNotes = [];
        this.toast.error('Unable to load notes.');
      }
    });
  }

  openCreateForm(): void {
    this.editingNoteId = undefined;
    const topicId = this.topics.length ? this.topics[0].topicId : null;
    this.noteForm.reset({ noteTitle: '', content: '', topicId, subTopicId: null });
    this.noteForm.markAsPristine();
    if (topicId) this.loadSubTopics(topicId);
    this.noteForm.get('topicId')?.enable();
    this.noteForm.get('subTopicId')?.enable();
    this.showForm = true;
  }

  editNote(note: Note): void {
    this.editingNoteId = note.noteId;
    this.noteForm.patchValue({ noteTitle: note.noteTitle, content: note.content ?? '' });
    this.noteForm.markAsPristine();
    this.http.get<SubTopic>(`${environment.apiUrl}/SubTopic/${note.subTopicId}`).subscribe((st) => {
      this.noteForm.patchValue({ topicId: st.topicId });
      this.loadSubTopics(st.topicId);
      this.noteForm.patchValue({ subTopicId: note.subTopicId });
      this.noteForm.get('topicId')?.disable();
      this.noteForm.get('subTopicId')?.disable();
    });
    this.showForm = true;
  }

  cancelForm(): void {
    if (this.noteForm.dirty) {
      this.confirmationService.confirm({
        title: 'Discard changes?',
        message: 'You have unsaved changes in this note form. Do you want to close it and lose them?',
        confirmText: 'Discard',
        cancelText: 'Keep editing',
      }).subscribe((confirmed) => {
        if (confirmed) {
          this.closeNoteForm();
        }
      });
      return;
    }

    this.closeNoteForm();
  }

  private closeNoteForm(): void {
    this.showForm = false;
    this.editingNoteId = undefined;
    const topicId = this.topics.length ? this.topics[0].topicId : null;
    this.noteForm.reset({ noteTitle: '', content: '', topicId, subTopicId: null });
    this.noteForm.markAsPristine();
    this.noteForm.get('topicId')?.enable();
    this.noteForm.get('subTopicId')?.enable();
  }

  openNoteView(note: Note): void {
    this.selectedViewNote = note;
    this.showViewModal = true;
  }

  closeNoteView(): void {
    this.showViewModal = false;
    this.selectedViewNote = null;
  }

  saveNote(): void {
    if (this.noteForm.invalid) {
      this.noteForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const form = this.noteForm.value;

    if (this.editingNoteId) {
      const payload = {
        noteTitle: form.noteTitle,
        content: form.content
      };
      var request = this.http.put(`${environment.apiUrl}/notes/${this.editingNoteId}`, payload);
    } else {
      const payload = {
        subTopicId: form.subTopicId,
        noteTitle: form.noteTitle,
        content: form.content
      };
      var request = this.http.post(`${environment.apiUrl}/notes`, payload);
    }

    request.subscribe({
      next: () => {
        this.isSubmitting = false;
        this.showForm = false;
        this.noteForm.markAsPristine();
        this.noteForm.get('topicId')?.enable();
        this.noteForm.get('subTopicId')?.enable();
        this.loadNotes();
        this.toast.success(this.editingNoteId ? 'Note updated.' : 'Note created.');
      },
      error: () => {
        this.isSubmitting = false;
        this.toast.error('Unable to save note right now.');
      }
    });
  }

  deleteNote(noteId: number): void {
    this.confirmationService.confirmDelete('Delete this note?').subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.http.delete(`${environment.apiUrl}/notes/${noteId}`).subscribe({
        next: () => {
          this.loadNotes();
          this.toast.success('Note deleted.');
        },
        error: () => this.toast.error('Unable to delete note.'),
      });
      this.cdr.detectChanges();
    });
  }

  filteredNotes(): Note[] {
    this.visibleNotes = this.getVisibleNotes();
    return this.visibleNotes;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.loadNotes();
  }

  clearFilter(): void {
    this.topicFilter = '';
    this.filteredNotes();
  }

  private getVisibleNotes(): Note[] {
    if (this.searchTerm.trim() === '' && !this.topicFilter) {
      return this.notes;
    }

    return this.notes.filter((note) => {
      const matchesSearch = `${note.noteTitle} ${note.content}`.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesTopic = this.topicFilter
        ? this.matchesTopicFilter(note)
        : true;
      return matchesSearch && matchesTopic;
    });
  }

  private matchesTopicFilter(note: Note): boolean {
    if (!this.topicFilter) {
      return true;
    }

    if (this.topicFilter.startsWith('subtopic-')) {
      const subtopicId = Number(this.topicFilter.replace('subtopic-', ''));
      return note.subTopicId === subtopicId;
    }

    if (this.topicFilter.startsWith('topic-')) {
      const topicId = Number(this.topicFilter.replace('topic-', ''));
      const selectedTopicSubtopics = this.subTopicsAll.filter((sub) => sub.topicId === topicId).map((sub) => sub.subTopicId);
      return selectedTopicSubtopics.includes(note.subTopicId);
    }

    return true;
  }

  getSubTopicName(id: number): string {
    const s = this.subTopicsAll.find((x) => x.subTopicId === id);
    return s ? s.subTopicName : `#${id}`;
  }
  // // Inside your component.ts

  getTruncatedContent(content?:  string | null): any {

  if (!content) return '';

  const plainText = content.replace(/<[^>]*>/g, '');
  const words = plainText.trim().split(/\s+/);

  if (words.length <= 100) {
    return this.getSafeHtml(content);
  }

  const truncatedText = words.slice(0, 100).join(' ') + '...';

  return this.getSafeHtml(truncatedText);
}

}
