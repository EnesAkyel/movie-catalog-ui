import { TestBed } from '@angular/core/testing';
import {
  HttpClient,
  HttpRequest,
  provideHttpClient,
  withInterceptors,
} from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { throwError } from 'rxjs';

import { authInterceptor } from './auth-interceptor';
import { ErrorPopupService } from '../error-popup/error-popup-service';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let router: Router;
  let errorPopupService: ErrorPopupService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    errorPopupService = TestBed.inject(ErrorPopupService);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches an Authorization header when a token is stored', () => {
    localStorage.setItem('authToken', 'jwt-token');

    http.get('/movies').subscribe();

    const req = httpMock.expectOne('/movies');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token');
    req.flush({});
  });

  it('sends the request unmodified when there is no token', () => {
    http.get('/movies').subscribe();

    const req = httpMock.expectOne('/movies');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush({});
  });

  it('logs out, navigates to /login, and shows a popup on a 401, without emitting next or error', () => {
    localStorage.setItem('authToken', 'jwt-token');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const popupSpy = vi.fn();
    errorPopupService.popup$.subscribe(popupSpy);
    const next = vi.fn();
    const error = vi.fn();

    http.get('/movies').subscribe({ next, error });

    const req = httpMock.expectOne('/movies');
    req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(localStorage.getItem('authToken')).toBeNull();
    expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    expect(popupSpy).toHaveBeenCalledWith({
      message: 'Your session has expired. Please log in again.',
      refreshable: false,
    });
    expect(next).not.toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
  });

  it('shows a refreshable popup and still propagates non-401 4XX/5XX errors, without logging out', () => {
    localStorage.setItem('authToken', 'jwt-token');
    const navigateSpy = vi.spyOn(router, 'navigate');
    const popupSpy = vi.fn();
    errorPopupService.popup$.subscribe(popupSpy);
    const error = vi.fn();

    http.get('/movies').subscribe({ error });

    const req = httpMock.expectOne('/movies');
    req.flush('Server error', { status: 500, statusText: 'Server Error' });

    expect(localStorage.getItem('authToken')).toBe('jwt-token');
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(popupSpy).toHaveBeenCalledWith({
      message: 'Something went wrong. Please refresh the page and try again.',
      refreshable: true,
    });
    expect(error).toHaveBeenCalled();
  });

  it('propagates a network failure (status 0) without showing a popup', () => {
    localStorage.setItem('authToken', 'jwt-token');
    const popupSpy = vi.fn();
    errorPopupService.popup$.subscribe(popupSpy);
    const error = vi.fn();

    http.get('/movies').subscribe({ error });

    const req = httpMock.expectOne('/movies');
    req.error(new ProgressEvent('error'));

    expect(popupSpy).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalled();
  });

  it('passes non-HttpErrorResponse errors through untouched', () => {
    const popupSpy = vi.fn();
    errorPopupService.popup$.subscribe(popupSpy);
    const boom = new Error('boom');
    const next = () => throwError(() => boom);

    const result$ = TestBed.runInInjectionContext(() =>
      authInterceptor(new HttpRequest('GET', '/movies'), next),
    );

    const error = vi.fn();
    result$.subscribe({ error });

    expect(error).toHaveBeenCalledWith(boom);
    expect(popupSpy).not.toHaveBeenCalled();
  });
});
