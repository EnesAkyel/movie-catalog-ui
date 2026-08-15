import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

const TOKEN_KEY = 'authToken';

export interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root',
})

//handles login/logout and JWT storage for the app
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  baseURL: string;

  constructor() {
    this.baseURL = environment.apiUrl;
  }

  public login(username: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(this.baseURL + '/auth/login', {
        username,
        password,
      })
      .pipe(tap((res) => localStorage.setItem(TOKEN_KEY, res.token)));
  }

  public logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    void this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
