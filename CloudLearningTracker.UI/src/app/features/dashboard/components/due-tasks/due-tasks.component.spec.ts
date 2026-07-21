import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DueTasksComponent } from './due-tasks.component';

describe('DueTasksComponent', () => {
  let component: DueTasksComponent;
  let fixture: ComponentFixture<DueTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DueTasksComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DueTasksComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
