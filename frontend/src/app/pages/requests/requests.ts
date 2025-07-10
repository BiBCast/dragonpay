// src/app/requests/requests.component.ts
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RequestCreateComponent } from './request-create.component';
import {
  Contact,
  PaymentRequestWithUser,
} from '../../../api-client/data-contracts';

@Component({
  standalone: true,
  selector: 'app-requests',
  imports: [CommonModule, FormsModule, RequestCreateComponent],
  templateUrl: './requests.html',
  styleUrls: ['./requests.css'],
})
export class RequestsComponent implements OnInit {
  allRequests: PaymentRequestWithUser[] = [];
  pendingRequests: PaymentRequestWithUser[] = [];
  myContacts: Contact[] = [];
  loading = false;
  error: string | null = null;
  showRequestModal = false;
  selectedRequest: PaymentRequestWithUser | null = null;

  @Output() requestHandled = new EventEmitter<{ id: number; status: string }>();

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.reloadRequests();
    this.loadContacts();
  }

  reloadRequests() {
    this.loading = true;
    this.error = null;
    this.http
      .get<PaymentRequestWithUser[]>('http://localhost:8000/requests')
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

  handleRequest(req: PaymentRequestWithUser, action: 'accept' | 'decline') {
    this.loading = true;
    this.error = null;

    this.http
      .put<PaymentRequestWithUser>(`http://localhost:8000/requests/decision`, {
        id: req.id,
        action,
      })
      .subscribe({
        next: (updated) => {
          // aggiorna stato localmente
          req.status = updated.status;

          this.pendingRequests = this.pendingRequests.filter(
            (r) => r.id !== req.id
          );

          this.requestHandled.emit({
            id: req.id || 0,
            status: updated.status || '',
          });
          this.loading = false;
        },
        error: () => {
          this.error = `Failed to ${action} request`;
          this.loading = false;
        },
      });
  }

  onRequestCreated() {
    this.showRequestModal = false;
    this.reloadRequests();
  }

  viewRequestDetail(req: PaymentRequestWithUser) {
    this.selectedRequest = req;
  }

  closeDetail() {
    this.selectedRequest = null;
  }
}
