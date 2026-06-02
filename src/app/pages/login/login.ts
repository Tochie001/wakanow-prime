import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { PrimeMark } from '../../components/prime-mark/prime-mark';

@Component({
  selector: 'app-login',
  imports: [PrimeMark],
  styleUrl: './login.css',
  template: `
<div class="lg-page">

  <!-- HERO BAND -->
  <header class="lg-hero">
    <h1>Welcome back</h1>
    <p>Log in to manage your bookings and access exclusive deals</p>
  </header>

  <!-- CARD -->
  <div class="lg-card">
    <button type="button" class="lg-social">
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 0 1 0-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1 0 24 44a20 20 0 0 0 19.6-23.5Z"/>
        <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8A12 12 0 0 1 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 0 0 6.3 14.7Z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0 1 12.7 28l-6.5 5A20 20 0 0 0 24 44Z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 0 1-4.1 5.6l6.2 5.2C37 36.6 44 31 44 24c0-1.2-.1-2.4-.4-3.5Z"/>
      </svg>
      Continue with Google
    </button>

    <button type="button" class="lg-social">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M16.4 12.7c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.7 2.3-1.6 2.8-.4 6.9 1.1 9.2.8 1.1 1.6 2.4 2.8 2.3 1.1 0 1.5-.7 2.9-.7 1.3 0 1.7.7 2.9.7 1.2 0 2-1.1 2.7-2.2.9-1.3 1.2-2.5 1.3-2.5-.1 0-2.4-1-2.4-3.6ZM14.2 5.9c.6-.8 1-1.8.9-2.9-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-.9 2.7.9.1 2-.5 2.7-1.2Z"/>
      </svg>
      Continue with Apple
    </button>

    <div class="lg-divider"><span>or sign in with email</span></div>

    <label class="lg-field">
      <span>Email Address</span>
      <input type="email" placeholder="you@example.com" autocomplete="email" />
    </label>

    <button type="button" class="lg-continue">Continue</button>

    <p class="lg-signup">Don't have an account?<a href="#">Sign up</a></p>

    <!-- DEMO ACCOUNTS -->
    <div class="lg-divider lg-divider-demo"><span>or use a demo account</span></div>

    <div class="lg-demo">
      <button type="button" class="lg-demo-btn lg-demo-prime" (click)="enterAsPrime()">
        <span class="lg-demo-icon" aria-hidden="true"><app-prime-mark /></span>
        <span class="lg-demo-text">
          <strong>Log in as a Prime member</strong>
          <small>Gbolahan Shobande · Family plan</small>
        </span>
      </button>
      <button type="button" class="lg-demo-btn" (click)="enterAsNonMember()">
        <span class="lg-demo-icon lg-demo-icon-plain" aria-hidden="true">○</span>
        <span class="lg-demo-text">
          <strong>Log in as a non-member</strong>
          <small>Egwuatu Tochi · no membership yet</small>
        </span>
      </button>
    </div>
  </div>
</div>
  `,
})
export class LoginPage {
  private auth = inject(AuthService);
  private router = inject(Router);

  enterAsPrime() {
    this.auth.loginAsPrime();
    this.router.navigate(['/profile']);
  }

  enterAsNonMember() {
    this.auth.loginAsNonMember();
    this.router.navigate(['/profile']);
  }
}
