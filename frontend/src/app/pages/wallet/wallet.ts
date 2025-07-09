// wallet.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WalletModalComponent } from './add-money-modal';
import { SendMoneyModalComponent } from './send-money-modal';
import { AuthService } from '../../auth.services';

@Component({
  standalone: true,
  selector: 'app-wallet',
  imports: [
    CommonModule,
    FormsModule,
    WalletModalComponent,
    SendMoneyModalComponent,
  ],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class WalletComponent {
  private auth = inject(AuthService);
  user$ = this.auth.getUserAccount(); // Observable<User | null>
  showAddMoneyModal = false;
  showSendMoneyModal = false;
  balance = 0;
  currency = 'EUR';

  constructor(private http: HttpClient) {}
  refreshAccount() {
    this.user$ = this.auth.getUserAccount();
  }

  openAddMoneyModal() {
    this.showAddMoneyModal = true;
  }
  closeAddMoneyModal() {
    this.showAddMoneyModal = false;
  }
  openSendMoneyModal() {
    this.showSendMoneyModal = true;
  }
  closeSendMoneyModal() {
    this.showSendMoneyModal = false;
  }

  // No longer needed: addMoney(event)

  onAddMoneySuccess() {
    this.refreshAccount();
  }

  sendMoney(event: { contact: string; amount: number; currency: string }) {
    // POST to backend (replace URL with your endpoint)
    this.http.post('/wallet/sendMoney', event).subscribe({
      next: () => {
        this.closeSendMoneyModal();
        this.refreshAccount(); // <-- refresh after top-up
        // Optionally refresh balance here
      },
      error: (err) => {
        alert(
          'Failed to add money: ' + (err?.error?.message || err.statusText)
        );
      },
    });
  }
}
