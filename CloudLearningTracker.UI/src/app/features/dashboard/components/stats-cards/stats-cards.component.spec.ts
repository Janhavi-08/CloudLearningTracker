import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { StatsCardsComponent } from './stats-cards.component';
import { SubTopic } from '../../../../core/models/subtopic';

describe('StatsCardsComponent', () => {
  let component: StatsCardsComponent;
  let fixture: ComponentFixture<StatsCardsComponent>;

  beforeEach(async () => {
    const dashboardServiceStub = {
      getProgress: () => of({ completionPercentage: 0, completedTasks: 0, totalTasks: 0, inProgressTasks: 0, notStartedTasks: 0 }),
      getTopics: () => of([]),
      getSubTopics: () => of([]),
      getTasksBySubTopic: () => of([]),
      getNotesBySubTopic: () => of([]),
      createTask: () => of({ taskId: 1 }),
      createNote: () => of({ noteId: 1 }),
    };

    await TestBed.configureTestingModule({
      imports: [StatsCardsComponent],
      providers: [{ provide: DashboardService, useValue: dashboardServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open an inline task form for the selected subtopic without routing away', () => {
    const subtopic: SubTopic = {
      subTopicId: 7,
      subTopicName: 'Routing',
      description: 'Angular routing',
      topicId: 1,
    };

    component.openItemForm(subtopic, 'task');

    expect(component.showSubtopicListModal).toBeFalse();
    expect(component.showManageModal).toBeFalse();
    expect(component.activeFormSubtopic).toEqual(subtopic);
    expect(component.showTaskFormModal).toBeTrue();
    expect(component.showNoteFormModal).toBeFalse();
  });
});
