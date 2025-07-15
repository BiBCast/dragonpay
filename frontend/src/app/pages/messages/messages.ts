import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-messages',
  imports: [CommonModule],
  template: `
    <div class="page-container">
      <h2>Messages Page</h2>
      <p>
        This is the messages page content. The header and sidebar remain
        visible.
      </p>
    </div>
  `,
  styles: [
    `
      .page-container {
        background: white;
        padding: 30px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      }
    `,
  ],
})
export class MessagesComponent {}
