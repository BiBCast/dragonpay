import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface User {
  id: number;
  username: string;
  full_name: string;
}

@Component({
  standalone: true,
  selector: 'app-send-money-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()"></div>
    <div class="modal">
      <h2>Send Money</h2>
      <form (ngSubmit)="submit()" #form="ngForm">
        <label>
          Contact
          <ng-container *ngIf="useUserSelect; else freeInput">
            <select
              [(ngModel)]="contact"
              name="contact"
              required
              #contactSelect="ngModel"
            >
              <option value="" disabled>Select a user</option>
              <option *ngFor="let u of users" [value]="u.username">
                {{ u.full_name }} ({{ u.username }})
              </option>
            </select>
            <div
              class="error"
              *ngIf="
                contactSelect.invalid &&
                (contactSelect.dirty || contactSelect.touched)
              "
            >
              <span *ngIf="contactSelect.errors?.['required']">
                Contact is required.
              </span>
            </div>
          </ng-container>
          <ng-template #freeInput>
            <input
              type="text"
              [(ngModel)]="contact"
              name="contact"
              required
              #contactInput="ngModel"
              [readonly]="readonlyContact"
            />
            <div
              class="error"
              *ngIf="
                contactInput.invalid &&
                (contactInput.dirty || contactInput.touched)
              "
            >
              <span *ngIf="contactInput.errors?.['required']">
                Contact is required.
              </span>
            </div>
          </ng-template>
        </label>

        <label>
          Amount
          <input
            type="number"
            [(ngModel)]="amount"
            name="amount"
            required
            min="0.01"
            step="0.01"
            #amountInput="ngModel"
          />
        </label>
        <div
          class="error"
          *ngIf="
            amountInput.invalid && (amountInput.dirty || amountInput.touched)
          "
        >
          <span *ngIf="amountInput.errors?.['required']">
            Amount is required.
          </span>
          <span *ngIf="amountInput.errors?.['min']">
            Amount must be at least 0.01.
          </span>
        </div>

        <label>
          Currency
          <select
            [(ngModel)]="currency"
            name="currency"
            required
            #currencyInput="ngModel"
          >
            <option value="EUR">EUR</option>
          </select>
        </label>
        <div
          class="error"
          *ngIf="
            currencyInput.invalid &&
            (currencyInput.dirty || currencyInput.touched)
          "
        >
          <span *ngIf="currencyInput.errors?.['required']">
            Currency is required.
          </span>
        </div>

        <div class="modal-actions">
          <button type="submit" [disabled]="loading || !form.form.valid">
            Send
          </button>
          <button type="button" (click)="onClose()">Cancel</button>
        </div>
        <div class="error" *ngIf="error">{{ error }}</div>
      </form>
    </div>
  `,
  styleUrls: ['./wallet-modal.css'],
})
export class SendMoneyModalComponent implements OnInit {
  @Input() show = false;
  @Input() contact = '';
  @Input() readonlyContact = false;
  @Input() useUserSelect = false; // new flag
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<{
    contact: string;
    amount: number;
    currency: string;
  }>();

  users: User[] = []; // loaded users
  amount = 0;
  currency = 'EUR';
  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    if (this.useUserSelect) {
      this.fetchUsers();
    }
  }

  onClose() {
    this.close.emit();
  }

  private fetchUsers() {
    this.http
      .get<User[]>('http://localhost:8000/users') // your endpoint
      .subscribe({
        next: (list) => (this.users = list),
        error: () => (this.error = 'Could not load users'),
      });
  }

  submit() {
    if (!this.contact || this.amount <= 0 || !this.currency) {
      return;
    }
    this.loading = true;
    this.error = null;

    this.http
      .post('http://localhost:8000/wallet/sendMoney', {
        contact: this.contact,
        amount: this.amount,
        currency: this.currency,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          this.success.emit({
            contact: this.contact,
            amount: this.amount,
            currency: this.currency,
          });
          this.onClose();
        },
        error: (err) => {
          this.loading = false;
          this.error =
            'Failed to send money: ' + (err?.error?.message || err.statusText);
        },
      });
  }
}
