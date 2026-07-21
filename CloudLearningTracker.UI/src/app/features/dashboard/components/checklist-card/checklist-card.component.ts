import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';

interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
}
@Component({
  selector: 'app-checklist-card',
  imports: [CommonModule, FormsModule, MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  templateUrl: './checklist-card.component.html',
  styleUrl: './checklist-card.component.css',
})
export class ChecklistCardComponent {
  
  checklistItems: ChecklistItem[] = [];
  completedChecklistCount = 0;
  checklistCompleted = false;
  private readonly checklistStorageKey = 'cloud-learning-daily-checklist';
  private readonly checklistAchievementStorageKey = 'cloud-learning-daily-achievement';
  private readonly checklistDateStorageKey = 'cloud-learning-daily-checklist-date';

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadChecklistState();
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
}
