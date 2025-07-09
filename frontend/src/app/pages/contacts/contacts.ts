import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Contact } from '../../../api-client/data-contracts';
import { SendMoneyModalComponent } from '../wallet/send-money-modal';

@Component({
  standalone: true,
  selector: 'app-contacts',
  imports: [CommonModule, SendMoneyModalComponent],
  templateUrl: './contacts.html',
  styleUrl: './contacts.css',
})
export class ContactsComponent implements OnInit {
  constructor(private http: HttpClient) {}
  contacts: Contact[] = [];
  showSendMoneyModal = false;
  selectedContact: Contact | null = null;

  openSendMoneyModal(merchant: Contact) {
    this.selectedContact = merchant;
    this.showSendMoneyModal = true;
  }

  closeSendMoneyModal() {
    this.showSendMoneyModal = false;
    this.selectedContact = null;
  }

  ngOnInit() {
    this.getContacts().subscribe((contacts) => {
      this.contacts = contacts;
    });
  }

  getContacts() {
    return this.http.get<Contact[]>('http://localhost:8000/contacts');
  }
  sendMoneyToContact(event: {
    contact: string;
    amount: number;
    currency: string;
  }) {
    // POST to backend, using event and this.selectedMerchant
    this.closeSendMoneyModal();
  }
}
