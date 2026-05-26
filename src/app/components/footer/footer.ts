import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  imports: [],
  template: `
    <footer class="site-footer">
      <div class="container footer-grid">
        <div class="footer-brand">
          <div class="logo logo-light">
            <svg viewBox="0 0 140 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <text x="0" y="24" font-family="Inter, sans-serif" font-size="26" font-weight="800" fill="#2196F3">Wakanow</text>
              <path d="M14 4 L18 0 L22 4 L18 8 Z" fill="#FF7A00"/>
            </svg>
          </div>
          <p class="footer-blurb">Africa's leading online travel company. Flights, hotels, holiday packages — pay in Naira.</p>
          <div class="socials" aria-label="Social media">
            <a href="#" aria-label="Facebook"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 1 0-11.6 9.9V15h-2.5v-3h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.3.2 2.3.2v2.5h-1.3c-1.3 0-1.7.8-1.7 1.6V12h2.9l-.5 3h-2.4v6.9A10 10 0 0 0 22 12Z"/></svg></a>
            <a href="#" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.9 2H22l-7.4 8.5L23 22h-6.8l-5.3-7-6.1 7H1.7l8-9.1L1 2h6.9l4.8 6.4L18.9 2Zm-2.4 18h1.9L7.6 4H5.6l10.9 16Z"/></svg></a>
            <a href="#" aria-label="Instagram"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg></a>
            <a href="#" aria-label="LinkedIn"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.1A4.2 4.2 0 0 1 17.6 9c4 0 4.7 2.6 4.7 6V21h-4v-5.4c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9V21h-4V9Z"/></svg></a>
            <a href="#" aria-label="YouTube"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23 7.2c-.2-1.5-1.2-2.5-2.7-2.7C18 4 12 4 12 4s-6 0-8.3.5C2.2 4.7 1.2 5.7 1 7.2.5 9.5.5 12 .5 12s0 2.5.5 4.8c.2 1.5 1.2 2.5 2.7 2.7C6 20 12 20 12 20s6 0 8.3-.5c1.5-.2 2.5-1.2 2.7-2.7.5-2.3.5-4.8.5-4.8s0-2.5-.5-4.8ZM9.8 15.4V8.6L15.5 12l-5.7 3.4Z"/></svg></a>
          </div>
        </div>

        <div class="footer-col">
          <h4>Products</h4>
          <ul>
            <li><a href="#">Flights</a></li>
            <li><a href="#">Hotels</a></li>
            <li><a href="#">Holiday Packages</a></li>
            <li><a href="#">Visa Services</a></li>
            <li><a href="#">Business Travel</a></li>
            <li><a href="#">Travel Card</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Support</h4>
          <ul>
            <li><a href="#">Help Centre</a></li>
            <li><a href="#">Contact Us</a></li>
            <li><a href="#">Manage Booking</a></li>
            <li><a href="#">Cancellation Policy</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Prime</h4>
          <ul>
            <li><a href="#">Prime Terms</a></li>
            <li><a href="#">Eligible Routes</a></li>
            <li><a href="#">Partner Airlines</a></li>
            <li><a href="#">Contact Concierge</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4>Company</h4>
          <ul>
            <li><a href="#">About Wakanow</a></li>
            <li><a href="#">Careers</a></li>
            <li><a href="#">Affiliate Programme</a></li>
            <li><a href="#">Blog</a></li>
            <li><a href="#">Advertising</a></li>
            <li><a href="#">Know Before You Go</a></li>
          </ul>
        </div>
      </div>

      <div class="container footer-bottom">
        <p>© 2026 Wakanow Online Travel Agency. All rights reserved.</p>
        <ul>
          <li><a href="#">Privacy Policy</a></li>
          <li><a href="#">Terms of Service</a></li>
          <li><a href="#">Cookie Policy</a></li>
        </ul>
      </div>
    </footer>
  `,
})
export class Footer {}
