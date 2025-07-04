import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
          <input
            type="text"
            [(ngModel)]="contact"
            name="contact"
            required
            #contactInput="ngModel"
          />
        </label>
        <div
          class="error"
          *ngIf="
            contactInput.invalid && (contactInput.dirty || contactInput.touched)
          "
        >
          <span *ngIf="contactInput.errors?.['required']"
            >Contact is required.</span
          >
        </div>
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
          <span *ngIf="amountInput.errors?.['required']"
            >Amount is required.</span
          >
          <span *ngIf="amountInput.errors?.['min']"
            >Amount must be at least 0.01.</span
          >
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
          <span *ngIf="currencyInput.errors?.['required']"
            >Currency is required.</span
          >
        </div>
        <div class="modal-actions">
          <button type="submit" [disabled]="!form.form.valid">Send</button>
          <button type="button" (click)="onClose()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./wallet-modal.css'],
})
export class SendMoneyModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() send = new EventEmitter<{
    contact: string;
    amount: number;
    currency: string;
  }>();

  contact: string = '';
  amount: number = 0;
  currency: string = 'EUR';

  onClose() {
    this.close.emit();
  }

  submit() {
    if (this.contact && this.amount > 0 && this.currency) {
      this.send.emit({
        contact: this.contact,
        amount: this.amount,
        currency: this.currency,
      });
      this.onClose();
    }
  }
}
