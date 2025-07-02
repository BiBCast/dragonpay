// home.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule],
  template: `
    <div class="home-container">
      <div class="welcome-section">
        <h2>Welcome to Your Dashboard</h2>
        <p>
          Manage your account and access all features from the sidebar
          navigation.
        </p>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📈</div>
          <div class="stat-content">
            <h3>Total Sales</h3>
            <p class="stat-number">$12,345</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Active Users</h3>
            <p class="stat-number">1,234</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">📦</div>
          <div class="stat-content">
            <h3>Orders</h3>
            <p class="stat-number">567</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-content">
            <h3>Revenue</h3>
            <p class="stat-number">$45,678</p>
          </div>
        </div>
      </div>

      <div class="recent-activity">
        <h3>Recent Activity</h3>
        <div class="activity-list">
          <div class="activity-item">
            <span class="activity-time">2 hours ago</span>
            <span class="activity-text">New user registered</span>
          </div>
          <div class="activity-item">
            <span class="activity-time">4 hours ago</span>
            <span class="activity-text">Order #1234 completed</span>
          </div>
          <div class="activity-item">
            <span class="activity-time">6 hours ago</span>
            <span class="activity-text">System backup completed</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .home-container {
        max-width: 1200px;
      }

      .welcome-section {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        margin-bottom: 30px;
      }

      .welcome-section h2 {
        margin: 0 0 10px 0;
        color: #2c3e50;
        font-size: 2rem;
      }

      .welcome-section p {
        margin: 0;
        color: #7f8c8d;
        font-size: 1.1rem;
      }

      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }

      .stat-card {
        background: white;
        padding: 25px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        transition: transform 0.2s;
      }

      .stat-card:hover {
        transform: translateY(-2px);
      }

      .stat-icon {
        font-size: 3rem;
        margin-right: 20px;
      }

      .stat-content h3 {
        margin: 0 0 5px 0;
        color: #7f8c8d;
        font-size: 0.9rem;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .stat-number {
        margin: 0;
        color: #2c3e50;
        font-size: 1.8rem;
        font-weight: bold;
      }

      .recent-activity {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }

      .recent-activity h3 {
        margin: 0 0 20px 0;
        color: #2c3e50;
        font-size: 1.3rem;
      }

      .activity-list {
        display: flex;
        flex-direction: column;
        gap: 15px;
      }

      .activity-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 6px;
        border-left: 4px solid #3498db;
      }

      .activity-time {
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .activity-text {
        color: #2c3e50;
        font-weight: 500;
      }

      @media (max-width: 768px) {
        .stats-grid {
          grid-template-columns: 1fr;
        }

        .activity-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 5px;
        }
      }
    `,
  ],
})
export class HomeComponent {}
