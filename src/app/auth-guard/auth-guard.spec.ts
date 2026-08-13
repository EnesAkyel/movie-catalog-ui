import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { authGuard } from './auth-guard';
import { AuthService } from '../auth-service/auth-service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function runGuard(): boolean {
    return TestBed.runInInjectionContext(() =>
      authGuard(null as never, null as never),
    ) as boolean;
  }

  it('allows navigation when a token is stored', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(true);

    expect(runGuard()).toBe(true);
  });

  it('blocks navigation and redirects to /login when there is no token', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(false);
    const navigateSpy = vi.spyOn(router, 'navigate');

    expect(runGuard()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
