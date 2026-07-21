import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { EMPTY, throwError, finalize } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { SessionExpiredDialogComponent } from '../components/session-expired-dialog.component';
import { AuthService } from '../services/auth.service';
import { LoaderService } from '../services/loader.service';

let isSessionExpiredDialogOpen = false;

const clearAuthState = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem('accessToken');
  window.localStorage.removeItem('refreshToken');
  window.localStorage.removeItem('authSession');
};

const shouldShowSessionExpiredDialog = (error: any): boolean => {
  const status = error?.status;
  const message = [error?.error?.message, error?.message, error?.error?.error]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return status === 401 || status === 403 || /token|unauthorized|session|timeout|expired/i.test(message);
};

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const dialog = inject(MatDialog);
  const authService = inject(AuthService);
  const loader = inject(LoaderService);

  let effectiveToken: string | null = null;

  if (typeof window !== 'undefined') {
    const token = window.localStorage.getItem('accessToken');
    const session = window.localStorage.getItem('authSession');
    let sessionToken: string | null = null;

    // Safely parse JSON to handle hot-reload race conditions
    if (session) {
      try {
        const parsedSession = JSON.parse(session);
        sessionToken = parsedSession ? parsedSession.accessToken : null;
      } catch (e) {
        console.error('Failed to parse authSession during reload:', e);
      }
    }

    effectiveToken = token || sessionToken;
  }

  if (effectiveToken) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${effectiveToken}`
      }
    });
  }

  loader.show();

  const openSessionExpiredDialog = (): void => {
    if (typeof window === 'undefined' || isSessionExpiredDialogOpen) {
      return;
    }

    isSessionExpiredDialogOpen = true;

    setTimeout(() => {
      try {
        const dialogRef = dialog.open(SessionExpiredDialogComponent, {
          disableClose: true,
          width: '360px'
        });

        dialogRef.afterClosed().subscribe(() => {
          clearAuthState();
          authService.logout();
          isSessionExpiredDialogOpen = false;
        });
      } catch (dialogError) {
        console.error('Material Dialog crashed during hot-reload initialization:', dialogError);
        clearAuthState();
        authService.logout();
        window.location.href = '/login';
      }
    }, 0);
  };

  return next(req).pipe(
    catchError((error) => {
      if (shouldShowSessionExpiredDialog(error)) {
        clearAuthState();
        authService.logout();
        openSessionExpiredDialog();
        return EMPTY;
      }

      return throwError(() => error);
    })
    ,finalize(() => loader.hide())
  );
};
