import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { LoginPanel } from '../../components/login-panel/login-panel';

@Component({
  selector: 'app-login',
  imports: [LoginPanel],
  styleUrl: './login.css',
  template: `
<div class="lg-page">
  <header class="lg-hero">
    <h1>Welcome back</h1>
    <p>Log in to manage your bookings and access exclusive deals</p>
  </header>

  <div class="lg-card-wrap">
    <app-login-panel (loggedIn)="onLoggedIn()" />
  </div>
</div>
  `,
})
export class LoginPage {
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  onLoggedIn() {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    this.router.navigateByUrl(returnUrl || '/profile');
  }
}
