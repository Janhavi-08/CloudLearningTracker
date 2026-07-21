import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Session expired</h2>
    <mat-dialog-content>
      Your session has expired or is no longer valid. Please sign in again.
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-raised-button color="primary" (click)="signInAgain()">
        Sign in
      </button>
    </mat-dialog-actions>
  `
})
export class SessionExpiredDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SessionExpiredDialogComponent>,
    private router: Router
  ) {}

  signInAgain(): void {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('refreshToken');
      window.localStorage.removeItem('authSession');
    }

    this.dialogRef.close();
    this.router.navigate(['/login']).catch(() => {
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    });
  }
}
