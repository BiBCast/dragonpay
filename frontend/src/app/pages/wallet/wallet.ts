// wallet.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { WalletModalComponent } from './wallet-modal.component';

@Component({
  standalone: true,
  selector: 'app-wallet',
  imports: [CommonModule, FormsModule, WalletModalComponent],
  templateUrl: './wallet.html',
  styleUrl: './wallet.css',
})
export class WalletComponent {
  showModal = false;
  balance = 0;
  currency = 'EUR';

  constructor(private http: HttpClient) {}

  openModal() {
    this.showModal = true;
  }
  closeModal() {
    this.showModal = false;
  }

  addMoney(event: { amount: number; currency: string }) {
    // POST to backend (replace URL with your endpoint)
    this.http.post('/wallet/topup', event).subscribe({
      next: () => {
        this.closeModal();
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
