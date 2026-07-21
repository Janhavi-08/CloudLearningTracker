import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog.component';

@Injectable({ providedIn: 'root' })
export class ConfirmationService {
  constructor(private dialog: MatDialog) {}

  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      disableClose: true,
      data,
    });

    return dialogRef.afterClosed();
  }

  confirmDelete(message: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirm Deletion',
      message,
      confirmText: 'Delete',
      cancelText: 'Cancel',
    });
  }
}
