// main-layout.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterModule } from '@angular/router';
import { AuthService } from '../../auth.services';

@Component({
  standalone: true,
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class MainLayoutComponent {
  isSidebarCollapsed = false;

  auth = inject(AuthService);
  logout() {
    this.auth.logout();
  }
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }
}
