import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Merchant } from '../../../api-client/data-contracts';
import { SendMoneyModalComponent } from '../wallet/send-money-modal';

@Component({
  standalone: true,
  selector: 'app-merchants',
  imports: [CommonModule, SendMoneyModalComponent],
  templateUrl: './merchants.html',
  styleUrl: './merchants.css',
})
export class MerchantsComponent implements OnInit {
  merchants: Merchant[] = [];
  showSendMoneyModal = false;
  selectedMerchant: Merchant | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getMerchants().subscribe((merchants) => {
      this.merchants = merchants;
    });
  }

  getMerchants() {
    return this.http.get<Merchant[]>('http://localhost:8000/merchants');
  }

  openSendMoneyModal(merchant: Merchant) {
    this.selectedMerchant = merchant;
    this.showSendMoneyModal = true;
  }

  closeSendMoneyModal() {
    this.showSendMoneyModal = false;
    this.selectedMerchant = null;
  }

  sendMoneyToMerchant(event: {
    contact: string;
    amount: number;
    currency: string;
  }) {
    // POST to backend, using event and this.selectedMerchant
    this.closeSendMoneyModal();
  }
}
