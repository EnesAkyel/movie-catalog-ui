import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { authGuard } from './auth-guard';
import { AuthService } from '../auth-service/auth-service';

describe('authGuard', () => {
  let authService: AuthService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    authService = TestBed.inject(AuthService);
    router = TestBed.inject(Router);
  });

  afterEach(() => {
    localStorage.clear();
  });

  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() =>
      authGuard(null as never, null as never),
    ) as boolean | UrlTree;
  }

  it('allows navigation when a token is stored', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(true);

    expect(runGuard()).toBe(true);
  });

  it('blocks navigation and redirects to /login when there is no token', () => {
    vi.spyOn(authService, 'isLoggedIn').mockReturnValue(false);

    const result = runGuard();
    expect(result).toBeInstanceOf(UrlTree);
    expect(router.serializeUrl(result as UrlTree)).toBe('/login');
  });
});
