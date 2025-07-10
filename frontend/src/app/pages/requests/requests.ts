// requests.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RequestCreateComponent } from './request-create.component';

interface PaymentRequest {
  id: string;
  requester_id: number;
  requestee_id: number;
  amount: number;
  currency: string;
  message?: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  created_at: string;
  expires_at?: string;
}

interface Contact {
  id: number;
  username: string;
  nickname: string;
}

@Component({
  standalone: true,
  selector: 'app-requests',
  imports: [CommonModule, FormsModule, RequestCreateComponent],
  templateUrl: './requests.html',
  styleUrls: ['./requests.css'],
})
export class RequestsComponent implements OnInit {
  allRequests: PaymentRequest[] = [];
  pendingRequests: PaymentRequest[] = [];
  myContacts: Contact[] = [];
  loading = false;
  error: string | null = null;
  showRequestModal = false;

  @Output() requestHandled = new EventEmitter<{ id: string; status: string }>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.reloadRequests();
    this.loadContacts();
  }

  /** Fetch both all and pending requests */
  reloadRequests() {
    this.loading = true;
    this.error = null;

    this.http
      .get<PaymentRequest[]>('http://localhost:8000/requests')
      .subscribe({
        next: (list) => {
          this.allRequests = list;
          this.pendingRequests = list.filter((r) => r.status === 'pending');
          this.loading = false;
        },
        error: () => {
          this.error = 'Failed to load requests';
          this.loading = false;
        },
      });
  }

  private loadContacts() {
    this.http
      .get<Contact[]>('http://localhost:8000/contacts')
      .subscribe({ next: (list) => (this.myContacts = list) });
  }

  openRequestModal() {
    this.showRequestModal = true;
  }

  handleRequest(req: PaymentRequest, action: 'accepted' | 'declined') {
    this.loading = true;
    this.error = null;

    this.http
      .post(`http://localhost:8000/requests/${req.id}/${action}`, {})
      .subscribe({
        next: () => {
          req.status = action;
          this.pendingRequests = this.pendingRequests.filter(
            (r) => r.id !== req.id
          );
          this.requestHandled.emit({ id: req.id, status: action });
          this.loading = false;
        },
        error: () => {
          this.error = `Failed to ${action} request`;
          this.loading = false;
        },
      });
  }

  /** Called by the create modal on success */
  onRequestCreated() {
    this.showRequestModal = false;
    this.reloadRequests();
  }
}
