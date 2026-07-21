import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { NotesComponent } from './notes.component';
import { environment } from '../../../core/environments/environment';
import { Note } from '../../../core/models/note';

describe('NotesComponent', () => {
  let component: NotesComponent;
  let fixture: ComponentFixture<NotesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotesComponent, HttpClientTestingModule],
    }).compileComponents();

    fixture = TestBed.createComponent(NotesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all notes for the initial grid view when the search term is empty', () => {
    const mockNotes: Note[] = [
      {
        noteId: 1,
        noteTitle: 'First note',
        content: 'Some content',
        subTopicId: 7,
        createdDate: '2026-07-15T10:00:00Z'
      }
    ];

    component.loadNotes();

    const req = httpMock.expectOne(`${environment.apiUrl}/Notes`);
    expect(req.request.method).toBe('GET');

    req.flush(mockNotes);

    expect(component.notes).toEqual(mockNotes);
    expect(component.visibleNotes).toEqual(mockNotes);
  });

  it('should filter notes by a selected subtopic value', () => {
    component.notes = [
      {
        noteId: 1,
        noteTitle: 'First note',
        content: 'Some content',
        subTopicId: 7,
        createdDate: '2026-07-15T10:00:00Z'
      },
      {
        noteId: 2,
        noteTitle: 'Second note',
        content: 'Another content',
        subTopicId: 8,
        createdDate: '2026-07-15T10:00:00Z'
      }
    ];
    component.subTopicsAll = [
      { subTopicId: 7, topicId: 1, subTopicName: 'Components', createdDate: '2026-07-15T10:00:00Z' },
      { subTopicId: 8, topicId: 2, subTopicName: 'Templates', createdDate: '2026-07-15T10:00:00Z' }
    ];
    component.topicFilter = 'subtopic-7';

    expect(component.filteredNotes().map((note) => note.noteId)).toEqual([1]);
  });
});
