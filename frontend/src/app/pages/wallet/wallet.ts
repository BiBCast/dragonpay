import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.services';
import { Account } from '../../../api-client/data-contracts';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-wallet-page',
  template: `
    <div class="wallet">
      <button (click)="logout()">Logout</button>
      <div *ngIf="items">
        @for (item of items; track item.holder) {
        <h2>{{ item.holder }}</h2>
        <p>Balance: €{{ item.balance }}</p>
        } @empty {
        <li>There are no items.</li>
        }
        <!-- <h2>{{ account.holder }}</h2>
        <p>Balance: €{{ account.balance }}</p> -->
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
