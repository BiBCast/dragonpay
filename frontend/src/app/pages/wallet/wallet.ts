import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { AuthService } from '../../auth.services';
import { Account } from '../../../api-client/data-contracts';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-wallet-page',
  templateUrl: './wallet.html',
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
    // this.http;
    // this.http
    //   .get<Account[]>('http://localhost:8000/wallet')
    //   .subscribe((acc) => {
    //     this.items = Array.isArray(acc) ? acc : [acc];
    //   });
  }
  logout() {
    this.auth.logout();
  }
}
