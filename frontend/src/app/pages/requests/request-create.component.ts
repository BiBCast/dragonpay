import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../../../api-client/data-contracts';

@Component({
  standalone: true,
  selector: 'app-request-create-modal',
  imports: [CommonModule, FormsModule],
  templateUrl: './request-create.component.html',
  styleUrl: './request-create.component.css',
})
export class RequestCreateComponent implements OnInit {
  @Input() show = false;
  @Input() contacts: Contact[] = []; // pass in your user's contacts
  @Output() close = new EventEmitter<void>();
  @Output() success = new EventEmitter<void>();

  selectedContact = '';
  amount = 0;
  currency = 'EUR';
  message = '';
  expiresAt = '';

  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    // optionally, you could fetch contacts here instead of passing in
  }

  onClose() {
    this.close.emit();
  }

  submit() {
    if (!this.selectedContact || this.amount <= 0) {
      this.error = 'Contact and a positive amount are required';
      return;
    }
    this.loading = true;
    this.error = null;

    const payload: any = {
      requestee_id: Number(this.selectedContact),
      amount: this.amount,
      currency: this.currency,
      message: this.message || undefined,
      expires_at: this.expiresAt || undefined,
    };

    this.http.post('http://localhost:8000/requests/create', payload).subscribe({
      next: () => {
        this.loading = false;
        this.success.emit();
        this.onClose();
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to create request';
      },
    });
  }
}
