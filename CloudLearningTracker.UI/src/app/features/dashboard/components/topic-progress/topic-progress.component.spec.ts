import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { DashboardService } from '../../../../core/services/dashboard.service';
import { DashboardRefreshService } from '../../../../core/services/dashboard-refresh.service';
import { TopicProgressComponent } from './topic-progress.component';

describe('TopicProgressComponent', () => {
  let component: TopicProgressComponent;
  let fixture: ComponentFixture<TopicProgressComponent>;
  let dashboardService: jasmine.SpyObj<DashboardService>;

  beforeEach(async () => {
    dashboardService = jasmine.createSpyObj('DashboardService', ['getTopicProgress', 'getBoard']);
    dashboardService.getTopicProgress.and.returnValue(of([{ topicId: 1, topicName: 'Angular', totalTasks: 4, completedTasks: 2, completionPercentage: 50 }]));
    dashboardService.getBoard.and.returnValue(of({
      notStarted: [{ taskId: 1, taskTitle: 'Intro', taskStatusId: 1, taskStatus: 'Not Started', topicName: 'Angular', subTopicName: 'Basics' }],
      inProgress: [],
      completed: [{ taskId: 2, taskTitle: 'Components', taskStatusId: 3, taskStatus: 'Completed', topicName: 'Angular', subTopicName: 'Components' }],
    }));

    await TestBed.configureTestingModule({
      imports: [TopicProgressComponent],
      providers: [
        { provide: DashboardService, useValue: dashboardService },
        { provide: DashboardRefreshService, useValue: { onRefresh: () => of(null) } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopicProgressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should derive subtopic progress from board data', () => {
    expect(component.topics[0].subTopics?.length).toBe(2);
    expect(component.topics[0].subTopics?.[0].subTopicName).toBe('Basics');
    expect(component.topics[0].subTopics?.[0].completionPercentage).toBe(0);
    expect(component.topics[0].subTopics?.[1].completionPercentage).toBe(100);
  });
});
