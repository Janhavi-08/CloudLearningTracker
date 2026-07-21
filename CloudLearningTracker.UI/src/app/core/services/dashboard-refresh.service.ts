import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class DashboardRefreshService {
  private refresh$ = new Subject<void>();

  triggerRefresh(): void {
    this.refresh$.next();
  }

  onRefresh() {
    return this.refresh$.asObservable();
  }
}
