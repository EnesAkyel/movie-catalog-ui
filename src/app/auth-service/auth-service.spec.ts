import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';

import { AuthService } from './auth-service';
import { environment } from '../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  const baseUrl = environment.apiUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('starts logged out when there is no stored token', () => {
    expect(service.isLoggedIn()).toBe(false);
    expect(service.getToken()).toBeNull();
  });

  it('login posts credentials and stores the returned token', () => {
    service.login('alice', 'secret').subscribe();

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({
      username: 'alice',
      password: 'secret',
    });
    req.flush({ token: 'jwt-token' });

    expect(service.getToken()).toBe('jwt-token');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('logout clears the stored token and navigates to /login', () => {
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    localStorage.setItem('authToken', 'jwt-token');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(service.isLoggedIn()).toBe(false);
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
  });
});
