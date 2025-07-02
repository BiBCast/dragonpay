// main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { Account } from '../../../api-client/data-contracts';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../auth.services';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterModule],
  template: `
    <div class="layout-container">
      <!-- Header -->
      <header class="header">
        <div class="header-content">
          <h1 class="header-title">My Application</h1>
          <nav class="header-nav">
            <button class="nav-item">Profile</button>
            <button class="nav-item">Settings</button>
            <button class="nav-item" (click)="logout()">Logout</button>
          </nav>
        </div>
      </header>

      <div class="main-content">
        <!-- Sidebar -->
        <aside class="sidebar">
          <nav class="sidebar-nav">
            <a
              routerLink="/home/dashboard"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">🏠</span>
              Dashboard
            </a>
            <a
              routerLink="/home/profile"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">👤</span>
              Profile
            </a>
            <a
              routerLink="/home/settings"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">⚙️</span>
              Settings
            </a>
            <a
              routerLink="/home/reports"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">📊</span>
              Reports
            </a>
            <a
              routerLink="/home/messages"
              routerLinkActive="active"
              class="nav-link"
            >
              <span class="nav-icon">💬</span>
              Messages
            </a>
          </nav>
        </aside>

        <!-- Main Content Area -->
        <main class="content">
          <router-outlet></router-outlet>
        </main>
      </div>
    </div>
  `,
  styles: [
    `
      .layout-container {
        height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .header {
        background: #2c3e50;
        color: white;
        padding: 0 20px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        z-index: 1000;
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 60px;
      }

      .header-title {
        margin: 0;
        font-size: 1.5rem;
        font-weight: 600;
      }

      .header-nav {
        display: flex;
        gap: 15px;
      }

      .nav-item {
        background: none;
        border: none;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.2s;
      }

      .nav-item:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .main-content {
        flex: 1;
        display: flex;
        overflow: hidden;
      }

      .sidebar {
        width: 250px;
        background: #34495e;
        color: white;
        overflow-y: auto;
      }

      .sidebar-nav {
        padding: 20px 0;
      }

      .nav-link {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: white;
        text-decoration: none;
        transition: background-color 0.2s;
        border-left: 3px solid transparent;
      }

      .nav-link:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      .nav-link.active {
        background: rgba(255, 255, 255, 0.15);
        border-left-color: #3498db;
      }

      .nav-icon {
        margin-right: 12px;
        font-size: 1.2rem;
      }

      .content {
        flex: 1;
        background: #ecf0f1;
        overflow-y: auto;
        padding: 20px;
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 200px;
        }

        .header-title {
          font-size: 1.2rem;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  items: Account[] = [];
  constructor(private http: HttpClient, private auth: AuthService) {
    this.http;
    this.http
      .get<Account[]>('http://localhost:8000/wallet')
      .subscribe((acc) => {
        this.items = Array.isArray(acc) ? acc : [acc];
      });
  }
  logout() {
    this.auth.logout();
  }
}
