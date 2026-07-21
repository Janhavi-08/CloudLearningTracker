import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { CanActivateFn, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { AuthService } from '../services/auth.service';
import { authGuard } from './auth-guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });

  it('should allow access during server-side rendering so refresh does not redirect immediately', () => {
    TestBed.overrideProvider(PLATFORM_ID, { useValue: 'server' });
    TestBed.resetTestingModule();

    const serverTestBed = TestBed.configureTestingModule({
      imports: [RouterTestingModule]
    });

    const authService = serverTestBed.inject(AuthService);
    const router = serverTestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    const result = serverTestBed.runInInjectionContext(() => authGuard({} as any));

    expect(result).toBeTrue();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(authService.isAuthenticated()).toBeTrue();
  });

  it('should deny access when the stored token is expired', () => {
    const authService = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    const navigateSpy = spyOn(router, 'navigate');

    const createToken = (exp: number) => {
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ sub: '1', name: 'tester', exp }));
      return `${header}.${payload}.signature`;
    };

    window.localStorage.setItem('accessToken', createToken(Math.floor(Date.now() / 1000) - 60));

    const result = executeGuard({} as any);

    expect(result).toBeFalse();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(authService.isAuthenticated()).toBeFalse();
  });
});
