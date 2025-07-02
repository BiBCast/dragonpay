import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.services';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginPageComponent {
  form = new FormGroup({
    username: new FormControl(''),
    password: new FormControl(''),
  });
  errorMsg = '';
  loading = false;

  constructor(private auth: AuthService, private router: Router) {}

  onSubmit() {
    const { username, password } = this.form.value;
    this.errorMsg = '';
    this.loading = true;
    this.auth.login(username!, password!).subscribe({
      next: (ok) => {
        this.loading = false;
        if (ok) this.router.navigate(['/wallet']);
        else this.errorMsg = 'Login failed';
      },
      error: () => {
        this.loading = false;
        this.errorMsg = 'Login failed';
      },
    });
  }
}
export { AuthService };
// ...existing code...
