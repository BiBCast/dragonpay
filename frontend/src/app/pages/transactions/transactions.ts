// transactions.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Transaction } from '../../../api-client/data-contracts';
import { getTransactionIcon } from '../../utils';

@Component({
  standalone: true,
  selector: 'app-transactions',
  imports: [CommonModule],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class TransactionsComponent implements OnInit {
  transactions: Array<{
    type: string;
    merchant: string;
    amount: number;
    date: string;
    icon: string;
  }> = [];
  filteredTransactions: Array<{
    type: string;
    merchant: string;
    amount: number;
    date: string;
    icon: string;
  }> = [];
  filter: string = 'all';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http
      .get<Transaction[]>('http://localhost:8000/transactions')
      .subscribe((transactions) => {
        this.transactions = transactions.map((tx) => ({
          type: tx.type ?? '',
          merchant: tx.description ?? tx.type ?? '',
          amount: tx.amount ?? 0,
          date: tx.created_at ?? '',
          icon: getTransactionIcon(tx.type),
        }));
        this.applyFilter('all');
      });
  }

  applyFilter(filter: string) {
    this.filter = filter;
    if (filter === 'all') {
      this.filteredTransactions = this.transactions;
    } else if (filter === 'payments') {
      this.filteredTransactions = this.transactions.filter(
        (t) => t.type === 'payment'
      );
    } else if (filter === 'received') {
      this.filteredTransactions = this.transactions.filter((t) => t.amount > 0);
    } else if (filter === 'cashback') {
      this.filteredTransactions = this.transactions.filter(
        (t) => t.type === 'cashback'
      );
    } else if (filter === 'request') {
      this.filteredTransactions = this.transactions.filter(
        (t) => t.type === 'request'
      );
    }
  }
}
