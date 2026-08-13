import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';

import { LoginComponent } from './login';
import { environment } from '../../environments/environment';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let httpMock: HttpTestingController;
  let router: Router;
  const baseUrl = environment.apiUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('does not submit while the form is invalid', () => {
    component.login();

    httpMock.expectNone(`${baseUrl}/auth/login`);
  });

  it('navigates to /list on a successful login', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.loginForm.setValue({ username: 'alice', password: 'secret' });

    component.login();

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    req.flush({ token: 'jwt-token' });

    expect(navigateSpy).toHaveBeenCalledWith(['/list']);
  });

  it('shows an error message when login fails', () => {
    component.loginForm.setValue({ username: 'alice', password: 'wrong' });

    component.login();

    const req = httpMock.expectOne(`${baseUrl}/auth/login`);
    req.flush(
      { message: 'Unauthorized' },
      { status: 401, statusText: 'Unauthorized' },
    );

    expect(component.errorMessage).toBe('Invalid username or password.');
  });
});
