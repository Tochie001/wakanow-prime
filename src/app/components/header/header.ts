import { Component, signal } from '@angular/core';

@Component({
  selector: 'app-header',
  imports: [],
  template: `
    <header class="site-header">
      <div class="container header-inner">
        <a href="#" class="logo" aria-label="Wakanow home">
          <svg viewBox="0 0 140 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <text x="0" y="24" font-family="Inter, sans-serif" font-size="26" font-weight="800" fill="#2196F3">Wakanow</text>
            <path d="M14 4 L18 0 L22 4 L18 8 Z" fill="#FF7A00"/>
          </svg>
        </a>

        <nav class="primary-nav" aria-label="Primary" [class.is-open]="menuOpen()" [style.display]="menuOpen() ? 'flex' : ''">
          <a href="#">Flights</a>
          <a href="#">Hotels</a>
          <a href="#">Packages</a>
          <a href="#">Visa</a>
          <a href="#" class="is-active">Prime</a>
          <a href="#">Manage Booking</a>
          <a href="#">Travel Card</a>
        </nav>

        <div class="header-actions">
          <button class="region" aria-label="Region: Nigeria">
            <span class="flag" aria-hidden="true"></span>
          </button>
          <button class="lang">EN</button>
          <button class="cart" aria-label="Cart">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
          </button>
          <a href="#" class="link-btn">Log in</a>
          <a href="#" class="signup-btn">Sign up</a>
          <button class="hamburger" aria-label="Open menu" (click)="toggleMenu()">
            <span></span><span></span><span></span>
          </button>
        </div>
      </div>
    </header>
  `,
})
export class Header {
  menuOpen = signal(false);
  toggleMenu() { this.menuOpen.update(v => !v); }
}
