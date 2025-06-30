import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.services';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-wallet-page',
  template: `
    <div class="wallet">
      <button (click)="logout()">Logout</button>
      <div *ngIf="account">
        <h2>{{ account.holder }}</h2>
        <p>Balance: €{{ account.balance }}</p>
      </div>
    </div>
  `,
  styles: [
    `
      .wallet {
        padding: 20px;
      }
    `,
  ],
})
export class WalletPageComponent {
  account: any;
  constructor(private http: HttpClient, private auth: AuthService) {
    this.http
      .get('http://localhost:8000/wallet')
      .subscribe((acc) => (this.account = acc));
  }
  logout() {
    this.auth.logout();
  }
}
