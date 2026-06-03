import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import { TIERS, initials } from '../../data/membership';
import { PrimePanel } from '../../components/prime-panel/prime-panel';
import { PrimeMark } from '../../components/prime-mark/prime-mark';

type Section = 'trips' | 'personal' | 'travellers' | 'documents' | 'security' | 'prime';

interface NavItem {
  key: Section;
  badge: string;
  label: string;
  primeOnly?: boolean;
}

@Component({
  selector: 'app-profile',
  imports: [RouterLink, PrimePanel, PrimeMark],
  styleUrl: './profile.css',
  template: `
@if (user(); as u) {
<div class="pf">

  <!-- HERO -->
  <header class="pf-hero">
    <div class="pf-container">
      <nav class="pf-crumb" aria-label="Breadcrumb">
        <a routerLink="/">Home</a><span>›</span><a routerLink="/profile">My account</a><span>›</span><span class="pf-crumb-here">Profile</span>
      </nav>

      <div class="pf-hero-row">
        <div class="pf-hero-id">
          <span class="pf-avatar">{{ initials(u.firstName, u.lastName) }}</span>
          <div class="pf-hero-text">
            <span class="pf-hero-eyebrow">Customer profile</span>
            <h1>{{ u.firstName }} {{ u.lastName }}</h1>
            <p class="pf-hero-sub">{{ u.email }} · {{ u.phone }}</p>
            @if (isPrime()) {
              <span class="pf-prime-badge"><app-prime-mark /> Prime {{ tierName() }} member</span>
            }
          </div>
        </div>
        <div class="pf-hero-actions">
          <span class="pf-verified">Verified account</span>
          <button type="button" class="pf-edit-photo">Edit photo</button>
        </div>
      </div>
    </div>
  </header>

  <!-- BODY -->
  <div class="pf-body">
    <div class="pf-container pf-grid">

      <!-- SIDEBAR -->
      <aside class="pf-side">
        <span class="pf-side-title">Account</span>
        <nav class="pf-nav">
          @for (item of navItems(); track item.key) {
            <button type="button" class="pf-nav-item" [class.is-active]="active() === item.key"
                    [class.is-prime]="item.key === 'prime'" (click)="active.set(item.key)">
              <span class="pf-nav-badge">
                @if (item.key === 'prime') { <app-prime-mark /> } @else { {{ item.badge }} }
              </span>
              <span>{{ item.label }}</span>
            </button>
          }
        </nav>

        <button type="button" class="pf-logout" (click)="logout()">Log out</button>
      </aside>

      <!-- MAIN -->
      <main class="pf-main">

        <!-- JOIN PRIME BANNER (non-members) -->
        @if (!isPrime() && active() !== 'prime') {
          <section class="pf-banner">
            <div class="pf-banner-text">
              <span class="pf-banner-eyebrow"><app-prime-mark /> WakaPrime</span>
              <h2>Unlock member-only fares and VIP travel perks</h2>
              <p>Join Prime to save on every flight, hotel and package, with priority support and a black card experience.</p>
            </div>
            <a class="pf-banner-cta" routerLink="/" fragment="tiers">Join Prime →</a>
          </section>
        }

        @switch (active()) {
          @case ('prime') {
            <app-prime-panel />
          }
          @case ('personal') {
            <!-- OVERVIEW -->
            <section class="pf-card pf-overview">
              <div class="pf-overview-text">
                <span class="pf-eyebrow">Overview</span>
                <h2>Profile completion</h2>
                <p>Keep traveller details ready so booking and manage-booking flows can prefill accurately.</p>
              </div>
              <div class="pf-overview-stats">
                <div class="pf-ring" [style.--pct]="completion()">
                  <span>{{ completion() }}%</span>
                </div>
                <div class="pf-stat"><strong>{{ isPrime() ? '2' : '0' }}</strong><small>Bookings</small></div>
                <div class="pf-stat"><strong>{{ travellerCount() }}</strong><small>Travellers</small></div>
                <div class="pf-stat"><strong>4</strong><small>Documents</small></div>
              </div>
            </section>

            <!-- PERSONAL INFO -->
            <section class="pf-card">
              <div class="pf-card-head">
                <div>
                  <span class="pf-eyebrow">Personal information</span>
                  <h2>Primary customer details</h2>
                </div>
                <button type="button" class="pf-save">Save changes</button>
              </div>
              <div class="pf-fields">
                <label class="pf-field pf-field-locked">
                  <span>First name <span class="pf-lock" aria-hidden="true">🔒</span></span>
                  <input type="text" [value]="u.firstName" readonly />
                </label>
                <label class="pf-field pf-field-locked">
                  <span>Last name <span class="pf-lock" aria-hidden="true">🔒</span></span>
                  <input type="text" [value]="u.lastName" readonly />
                </label>
                <label class="pf-field pf-field-locked">
                  <span>Email <span class="pf-lock" aria-hidden="true">🔒</span></span>
                  <input type="email" [value]="u.email" readonly />
                </label>
                <label class="pf-field"><span>Phone</span><input type="tel" [value]="u.phone" /></label>
              </div>
              <p class="pf-note">
                <span class="pf-note-icon" aria-hidden="true">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </span>
                <span class="pf-note-text">Your legal name and email are locked and can only be changed <strong>once a year</strong>. To request a correction, contact Wakanow support.</span>
              </p>
            </section>
          }
          @default {
            <section class="pf-card pf-placeholder">
              <span class="pf-eyebrow">{{ activeLabel() }}</span>
              <h2>{{ activeLabel() }}</h2>
              <p>This section is part of the Wakanow account experience. Nothing to show in this demo yet.</p>
            </section>
          }
        }
      </main>

    </div>
  </div>
</div>
}
  `,
})
export class ProfilePage {
  private auth = inject(AuthService);
  private router = inject(Router);

  user = this.auth.user;
  isPrime = this.auth.isPrime;
  initials = initials;

  active = signal<Section>('personal');

  private baseNav: NavItem[] = [
    { key: 'trips', badge: 'T', label: 'Trip details' },
    { key: 'personal', badge: 'P', label: 'Personal information' },
    { key: 'prime', badge: '★', label: 'Manage Prime', primeOnly: true },
    { key: 'travellers', badge: 'A', label: 'Travellers' },
    { key: 'documents', badge: 'D', label: 'Travel documents' },
    { key: 'security', badge: 'S', label: 'Security' },
  ];

  navItems = computed(() => this.baseNav.filter((i) => !i.primeOnly || this.isPrime()));

  activeLabel = computed(() => this.baseNav.find((i) => i.key === this.active())?.label ?? '');

  tierName = computed(() => {
    const key = this.user()?.tier;
    return key ? TIERS[key].name : '';
  });

  travellerCount = computed(() => this.user()?.members?.length ?? 0);

  completion = computed(() => (this.isPrime() ? 80 : 0));

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
