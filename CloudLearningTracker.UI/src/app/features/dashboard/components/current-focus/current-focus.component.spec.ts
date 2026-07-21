import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { CurrentFocusComponent } from './current-focus.component';

describe('CurrentFocusComponent', () => {
  let component: CurrentFocusComponent;
  let fixture: ComponentFixture<CurrentFocusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentFocusComponent],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            getBoard: () =>
              of({
                notStarted: [
                  {
                    taskId: 1,
                    taskTitle: 'Read chapter',
                    taskStatusId: 1,
                    taskStatus: 'Not Started',
                    topicName: 'Angular',
                    subTopicName: 'Components',
                    dueDate: '2026-07-20',
                  },
                ],
                inProgress: [],
                completed: [],
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CurrentFocusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('builds focus from the board payload returned by the API', () => {
    expect(component.focus?.topicName).toBe('Angular');
    expect(component.focus?.subTopicName).toBe('Components');
    expect(component.focus?.totalTasks).toBe(1);
  });
});
