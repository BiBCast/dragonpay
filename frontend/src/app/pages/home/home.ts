import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import {
  Account,
  Merchant,
  Transaction,
} from '../../../api-client/data-contracts';
import { getTransactionIcon } from '../../utils';
import { SendMoneyModalComponent } from '../wallet/send-money-modal';

@Component({
  standalone: true,
  selector: 'app-home',
  imports: [CommonModule, SendMoneyModalComponent],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  onAddMoneySuccess() {
    throw new Error('Method not implemented.');
  }
  constructor(private http: HttpClient, private router: Router) {}
  stats = [
    {
      title: 'Total Balance',
      value: '€1,234.56',
      icon: '💰',
      trend: '+12.5%',
      trendUp: true,
    },
  ];

  recentTransactions = [
    {
      type: 'payment',
      merchant: 'Starbucks Coffee',
      amount: -4.5,
      date: '2 hours ago',
      icon: '☕',
    },
    {
      type: 'cashback',
      merchant: 'Amazon Purchase',
      amount: +2.3,
      date: '5 hours ago',
      icon: '📦',
    },
    {
      type: 'payment',
      merchant: 'Metro Ticket',
      amount: -2.2,
      date: '1 day ago',
      icon: '🚇',
    },
    {
      type: 'transfer',
      merchant: 'From Marco',
      amount: +25.0,
      date: '2 days ago',
      icon: '👤',
    },
  ];

  quickActions = [
    { title: 'Send Money', icon: '📤', action: 'send' },
    { title: 'Request Money', icon: '📥', action: 'request' },
    { title: 'Wallet', icon: '💸', action: 'wallet' },
  ];

  merchants: Merchant[] = [];
  showSendMoneyModal = false;
  selectedMerchant: Merchant | null = null;

  ngOnInit() {
    this.getWallet().subscribe((wallet) => {
      this.stats = [
        {
          title: 'Total Balance',
          value: wallet ? `€${wallet.balance}` : '€0.00',
          icon: '💰',
          trend: '+0%',
          trendUp: true,
        },
        {
          title: 'Monthly Transactions',
          value: '145',
          icon: '💳',
          trend: '+8.2%',
          trendUp: true,
        },
        {
          title: 'Saved Money',
          value: '€89.32',
          icon: '🎯',
          trend: '+24.1%',
          trendUp: true,
        },
        {
          title: 'Active Cashback',
          value: '€12.45',
          icon: '🔄',
          trend: '-2.3%',
          trendUp: false,
        },
      ];
    });

    this.getMerchants().subscribe((merchants) => {
      this.merchants = merchants;
    });

    this.getTransactions().subscribe((transactions) => {
      this.recentTransactions = transactions.map((tx) => ({
        type: tx.type ?? '',
        merchant: tx.description ?? tx.type ?? '',
        amount: tx.amount ?? 0,
        date: tx.created_at ?? '',
        icon: getTransactionIcon(tx.type),
      }));
    });
  }

  onQuickAction(action: string) {
    console.log('Quick action:', action);
    if (action === 'send') {
      this.router.navigate(['/home/contacts']);
    } else if (action === 'request') {
      this.router.navigate(['/home/requests']);
    } else if (action === 'wallet') {
      this.router.navigate(['/home/wallet']);
    }
  }

  toTransactions() {
    console.log('View all transactions');

    this.router.navigate(['/home/transactions']);
  }

  getCurrentDate(): string {
    return new Date().toLocaleDateString('it-IT', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  getWallet() {
    return this.http.get<Account>('http://localhost:8000/wallet');
  }

  getTransactions() {
    return this.http.get<Transaction[]>('http://localhost:8000/transactions');
  }

  getMerchants() {
    return this.http.get<Merchant[]>('http://localhost:8000/merchants');
  }

  getAbsoluteValue(amount: number): string {
    return Math.abs(amount).toFixed(2);
  }

  openSendMoneyModal(merchant: Merchant) {
    this.selectedMerchant = merchant;
    this.showSendMoneyModal = true;
  }

  onStatsGridClick() {
    this.router.navigate(['/home/wallet']);
  }

  toMerchants() {
    this.router.navigate(['/home/merchants']);
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
    this.closeSendMoneyModal();
  }
}
