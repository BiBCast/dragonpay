import { Component } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth.services';

@Component({
  standalone: true,
  selector: 'app-login-page',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" class="login-form">
      <input formControlName="username" placeholder="Username" required />
      <input
        formControlName="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit">Login</button>
    </form>
  `,
  styles: [
    `
      .login-form {
        max-width: 300px;
        margin: auto;
      }
    `,
  ],
})
// ...existing code...
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
