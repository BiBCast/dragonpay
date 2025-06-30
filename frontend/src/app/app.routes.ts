// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { LoginPageComponent } from './pages/login/login';
import { WalletPageComponent } from './pages/wallet/wallet';
import { AuthGuard } from './auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'wallet', component: WalletPageComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
  { path: '**', redirectTo: 'wallet' },
];
