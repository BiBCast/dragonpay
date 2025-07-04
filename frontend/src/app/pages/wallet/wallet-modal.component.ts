import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-wallet-modal',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-backdrop" (click)="onClose()"></div>
    <div class="modal">
      <h2>Add Money</h2>
      <form (ngSubmit)="submit()" #form="ngForm">
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
            >Number not valid.</span
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
          <button type="submit" [disabled]="!form.form.valid">Add</button>
          <button type="button" (click)="onClose()">Cancel</button>
        </div>
      </form>
    </div>
  `,
  styleUrls: ['./wallet-modal.component.css'],
})
export class WalletModalComponent {
  @Input() show = false;
  @Output() close = new EventEmitter<void>();
  @Output() add = new EventEmitter<{ amount: number; currency: string }>();

  amount: number = 0;
  currency: string = 'EUR';

  onClose() {
    this.close.emit();
  }

  submit() {
    if (this.amount > 0 && this.currency) {
      this.add.emit({ amount: this.amount, currency: this.currency });
      this.onClose();
    }
  }
}
