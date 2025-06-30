import 'zone.js';

import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter, Routes } from '@angular/router';
import {
  HTTP_INTERCEPTORS,
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http';

import { AppComponent } from './app/app.component';
import { LoginPageComponent } from './app/pages/login/login';
import { WalletPageComponent } from './app/pages/wallet/wallet';
import { AuthGuard } from './app/auth.guard';
import { JwtInterceptor } from './app/jwt.interceptor';

const routes: Routes = [
  { path: 'login', component: LoginPageComponent },
  { path: 'wallet', component: WalletPageComponent, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'wallet', pathMatch: 'full' },
];

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()), // supporto HttpClient + interceptor
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
  ],
});
