import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'browser' }]
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should treat a valid base64url JWT as authenticated', () => {
    const createToken = (exp: number) => {
      const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
      const payload = btoa(JSON.stringify({ sub: '1', name: 'tester', exp }));
      return `${header}.${payload}.signature`;
    };

    const token = createToken(Math.floor(Date.now() / 1000) + 60 * 60);
    window.localStorage.setItem('accessToken', token);
    window.localStorage.setItem('authSession', JSON.stringify({ accessToken: token, refreshToken: 'refresh', expiresAt: Date.now() + 60 * 60 * 1000 }));

    expect(service.isAuthenticated()).toBeTrue();
  });
});
