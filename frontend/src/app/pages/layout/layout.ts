// main-layout.ts
import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
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
  private auth = inject(AuthService);
  private router = inject(Router);
  user$ = this.auth.getUserProfile(); // Observable<User | null>

  logout() {
    this.auth.logout();
  }
  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  goToProfile() {
    this.router.navigate(['home/profile']);
  }
  onDashbord() {
    this.router.navigate(['home/dashboard']);
  }
}
