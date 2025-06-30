import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth/login';
  private tokenKey = 'access_token';
  constructor(private http: HttpClient, private router: Router) {}

  login(username: string, password: string) {
    return this.http
      .post<{ access_token: string }>(this.apiUrl, { username, password })
      .pipe(
        tap((res) => localStorage.setItem(this.tokenKey, res.access_token)),
        map(() => true)
      );
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  isAuthenticated() {
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken() {
    return localStorage.getItem(this.tokenKey);
  }
}
