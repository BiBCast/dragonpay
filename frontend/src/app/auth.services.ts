import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { User } from '../api-client/data-contracts';

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
  getCurrentUser() {
    const token = this.getToken();
    if (!token) return null;
    try {
      const decoded: any = jwtDecode(token);
      // Example: if your JWT has sub as user id
      return decoded;
    } catch {
      return null;
    }
  }
  getUserProfile() {
    const user = this.getCurrentUser();
    if (!user) return null;
    // Return the Observable so the component can subscribe
    return this.http.get<User>(`http://localhost:8000/users/me`);
  }
}
