import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';

type TierKey = 'individual' | 'duo' | 'family';

interface TierInfo {
  key: TierKey;
  name: string;
  price: number;
  travellers: number;
  position: string;
  benefits: string[];
}

interface Traveller {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  fillLater: boolean;
}

const TIERS: Record<TierKey, TierInfo> = {
  individual: {
    key: 'individual',
    name: 'Individual',
    price: 350_000,
    travellers: 1,
    position: 'For one frequent traveller.',
    benefits: ['Member-only fares', 'Priority support', 'Early access to travel deals', 'Visa Fast Track'],
  },
  duo: {
    key: 'duo',
    name: 'Duo',
    price: 600_000,
    travellers: 2,
    position: 'Two registered travellers sharing Prime.',
    benefits: ['Everything in Individual', 'Two registered travellers', 'Joint trip-planning support'],
  },
  family: {
    key: 'family',
    name: 'Family',
    price: 1_000_000,
    travellers: 4,
    position: 'A household plan for four travellers.',
    benefits: ['Everything in Individual + Duo', 'Four registered travellers', 'Family-rate hotel & package offers'],
  },
};

const blank = (): Traveller => ({
  firstName: '', lastName: '', email: '', phone: '', fillLater: false,
});

@Component({
  selector: 'app-join',
  imports: [FormsModule, RouterLink],
  styleUrl: './join.css',
  template: `
<div class="join-page">

  <!-- TOP STRIP -->
  <div class="join-strip">
    <div class="join-container">
      <a routerLink="/" class="join-back">← Back to plans</a>
      <div class="join-strip-meta">
        <span class="join-strip-tier">{{ tier().name }}</span>
        <span class="join-strip-price">{{ formatMoney(tier().price) }} <small>/ year</small></span>
      </div>
    </div>
  </div>

  @if (status() === 'success') {
    <!-- SUCCESS STATE -->
    <section class="join-success">
      <div class="join-container join-success-inner">
        <div class="join-success-check" aria-hidden="true">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <h1>You're a Prime <em>{{ tier().name }}</em> member.</h1>
        <p>We've sent your membership card and receipt to <strong>{{ travellers()[0].email || 'your email' }}</strong>. Prime pricing will apply automatically at checkout from your next booking.</p>

        <div class="join-success-meta">
          <div>
            <span class="lbl">Membership</span>
            <span class="val">WakaPrime · {{ tier().name }}</span>
          </div>
          <div>
            <span class="lbl">Charged today</span>
            <span class="val">{{ formatMoney(tier().price) }}</span>
          </div>
          <div>
            <span class="lbl">Renews</span>
            <span class="val">{{ renewalDate() }}</span>
          </div>
        </div>

        @if (laterCount() > 0) {
          <div class="join-success-note">
            You still have <strong>{{ laterCount() }}</strong> covered traveller{{ laterCount() === 1 ? '' : 's' }} to add. You can do this any time from your Prime dashboard.
          </div>
        }

        <div class="join-success-cta">
          <a routerLink="/" class="join-btn join-btn-primary">Back to Wakanow</a>
          <a routerLink="/login" class="join-btn join-btn-outline">Open dashboard</a>
        </div>
      </div>
    </section>
  } @else {
    <!-- FORM STATE -->
    <section class="join-main">
      <div class="join-container join-grid">

        <form class="join-form" (submit)="onSubmit($event)" novalidate>

          <header class="join-form-head">
            <h1>Join WakaPrime <em>· {{ tier().name }}</em></h1>
            <p>{{ tier().position }} Fill in member details below, then choose how you'd like to pay.</p>
          </header>

          <!-- STEP 01 -->
          <div class="join-step">
            <div class="join-step-num">1</div>
            <div class="join-step-content">
              <h2>Member information</h2>
              <p class="join-step-desc">{{ tier().travellers }} registered traveller{{ tier().travellers === 1 ? '' : 's' }} are covered by this plan.</p>

              <p class="join-passport-note">
                <span class="join-passport-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                </span>
                <span class="join-passport-text">Enter each traveller's first and last name <strong>exactly as it appears on their passport</strong>. This is the name used for every booking and can't be changed afterwards.</span>
              </p>

              @for (t of travellers(); track $index; let i = $index) {
                <div class="join-card" [class.is-collapsed]="t.fillLater && i > 0">
                  <header class="join-card-head">
                    <div>
                      <span class="join-card-badge">{{ travellerLabel(i) }}</span>
                      <h3>
                        @if (t.firstName || t.lastName) { {{ t.firstName }} {{ t.lastName }} } @else { Traveller {{ i + 1 }} }
                      </h3>
                    </div>

                    @if (i > 0) {
                      <label class="join-toggle">
                        <input type="checkbox" [checked]="t.fillLater" (change)="toggleFillLater(i)" />
                        <span class="join-toggle-track" aria-hidden="true"><span class="dot"></span></span>
                        <span class="join-toggle-text">Fill in later</span>
                      </label>
                    } @else if (t.email) {
                      @if (isEmailVerified()) {
                        <span class="join-verify-badge is-verified">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Email verified
                        </span>
                      } @else {
                        <span class="join-verify-wrap">
                          <span class="join-verify-badge is-unverified">Email unverified</span>
                          <button type="button" class="join-verify-btn" (click)="openVerify()">Verify</button>
                        </span>
                      }
                    }
                  </header>

                  @if (!t.fillLater || i === 0) {
                    <div class="join-fields">
                      <label class="jfield" [class.is-locked]="lockPrimary(i)">
                        <span>First name</span>
                        <input type="text" required [(ngModel)]="t.firstName" [name]="'first-' + i" autocomplete="given-name" [readonly]="lockPrimary(i)" (blur)="onPrimaryBlur(i)" />
                      </label>
                      <label class="jfield" [class.is-locked]="lockPrimary(i)">
                        <span>Last name</span>
                        <input type="text" required [(ngModel)]="t.lastName" [name]="'last-' + i" autocomplete="family-name" [readonly]="lockPrimary(i)" (blur)="onPrimaryBlur(i)" />
                      </label>
                      <label class="jfield" [class.is-locked]="lockPrimary(i)">
                        <span>Email</span>
                        <input type="email" [required]="i === 0" [(ngModel)]="t.email" [name]="'email-' + i" autocomplete="email" [readonly]="lockPrimary(i)" (blur)="onPrimaryBlur(i)" />
                      </label>
                      <label class="jfield">
                        <span>Phone</span>
                        <input type="tel" [required]="i === 0" [(ngModel)]="t.phone" [name]="'phone-' + i" autocomplete="tel" placeholder="+234 …" (blur)="onPrimaryBlur(i)" />
                      </label>
                    </div>
                    @if (lockPrimary(i)) {
                      <p class="join-locked-note">
                        <span class="join-locked-icon" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        </span>
                        <span>Your name and email are linked to your WakaPrime account and can only be changed once a year from your profile.</span>
                      </p>
                    }
                  } @else {
                    <p class="join-collapsed-note">
                      You'll add this traveller's details later from your Prime dashboard. They can't use Prime pricing until details are completed.
                    </p>
                  }
                </div>
              }
            </div>
          </div>

          <!-- STEP 02 -->
          <div class="join-step">
            <div class="join-step-num">2</div>
            <div class="join-step-content">
              <div class="join-pay-head">
                <span class="join-pay-head-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/>
                    <line x1="2" y1="10" x2="22" y2="10"/>
                  </svg>
                </span>
                <h2>Select preferred payment method</h2>
              </div>
              <p class="join-step-desc">Your membership activates as soon as your payment is confirmed.</p>

              <div class="join-pay-list" role="radiogroup" aria-label="Payment method">
                <label class="join-pay-option" [class.is-selected]="payMethod() === 'online'">
                  <input type="radio" name="payMethod" value="online"
                         [checked]="payMethod() === 'online'"
                         (change)="payMethod.set('online')" />
                  <span class="join-pay-radio" aria-hidden="true"><span class="dot"></span></span>
                  <span class="join-pay-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2"/>
                      <line x1="2" y1="10" x2="22" y2="10"/>
                    </svg>
                  </span>
                  <span class="join-pay-text">
                    <strong>Pay with Card or Bank</strong>
                    <span>Card, bank app or wallet</span>
                  </span>
                </label>
              </div>

              <label class="join-consent">
                <input type="checkbox" [(ngModel)]="agreed" name="agreed" />
                <span>I agree to the <a href="#">Prime membership terms</a> and registered traveller policy.</span>
              </label>

              @if (!isEmailVerified() && primaryComplete()) {
                <div class="join-verify-hint">
                  <span class="join-locked-icon" aria-hidden="true">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <span>Verify your email address to activate Prime and pay. <button type="button" class="join-verify-link" (click)="openVerify()">Verify now</button></span>
                </div>
              }

              @if (errorMessage()) {
                <div class="join-error">{{ errorMessage() }}</div>
              }

              <button class="join-btn join-btn-primary join-btn-lg" type="submit" [disabled]="status() === 'processing' || !agreed || !isEmailVerified()">
                @if (status() === 'processing') {
                  <span class="join-spinner" aria-hidden="true"></span>
                  Processing…
                } @else {
                  Pay and activate Prime
                }
              </button>
            </div>
          </div>
        </form>

        <!-- ORDER SUMMARY -->
        <aside class="join-summary">
          <div class="join-summary-inner">
            <header>
              <span class="join-eyebrow">Order summary</span>
              <h3>WakaPrime <em>{{ tier().name }}</em></h3>
              <p>{{ tier().travellers }} registered traveller{{ tier().travellers === 1 ? '' : 's' }} · annual membership</p>
            </header>

            <ul class="join-summary-list">
              @for (b of tier().benefits; track b) {
                <li>{{ b }}</li>
              }
            </ul>

            <dl class="join-summary-meta">
              <div>
                <dt>Subtotal</dt>
                <dd>{{ formatMoney(tier().price) }}</dd>
              </div>
              <div>
                <dt>VAT</dt>
                <dd>Included</dd>
              </div>
            </dl>

            <div class="join-summary-total">
              <span>Total today</span>
              <strong>{{ formatMoney(tier().price) }}</strong>
            </div>

            <div class="join-summary-foot">Renews {{ renewalDate() }} · cancel anytime before</div>
          </div>
        </aside>

      </div>
    </section>
  }

  <!-- EMAIL VERIFICATION (OTP) -->
  @if (otpOpen()) {
    <div class="join-otp-overlay" (click)="closeOtp()">
      <div class="join-otp-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true" aria-label="Verify your email">
        <header class="join-otp-head">
          <h3>Verify your email</h3>
          <button type="button" class="join-otp-x" (click)="closeOtp()" aria-label="Close">×</button>
        </header>
        <div class="join-otp-body">
          <p class="join-otp-lead">We sent a 6-digit code to <strong>{{ travellers()[0].email }}</strong>. Enter it below to verify your email.</p>
          <p class="join-otp-demo">Demo code: <strong>{{ otpCode() }}</strong></p>
          <input class="join-otp-input" type="text" inputmode="numeric" maxlength="6" [(ngModel)]="otpEntry" name="otp" placeholder="● ● ● ● ● ●" autocomplete="one-time-code" />
          @if (otpError()) { <p class="join-otp-error">{{ otpError() }}</p> }
          <p class="join-otp-resend">Didn't get it? <button type="button" class="join-verify-link" (click)="openVerify()">Resend code</button></p>
        </div>
        <footer class="join-otp-foot">
          <button type="button" class="join-btn join-btn-outline" (click)="closeOtp()">Cancel</button>
          <button type="button" class="join-btn join-btn-primary" (click)="confirmOtp()">Verify email</button>
        </footer>
      </div>
    </div>
  }

</div>
  `,
})
export class JoinPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private auth = inject(AuthService);

  tier = signal<TierInfo>(TIERS.individual);
  travellers = signal<Traveller[]>([blank()]);
  payMethod = signal<'online'>('online');
  status = signal<'idle' | 'processing' | 'success'>('idle');
  errorMessage = signal<string>('');
  agreed = false;

  // Email verification for the primary (contact) member.
  emailVerified = signal(false);
  verifiedEmail = signal('');
  otpOpen = signal(false);
  otpCode = signal('');
  otpError = signal('');
  otpEntry = '';
  private otpPrompted = false;

  constructor() {
    this.route.paramMap.subscribe(p => {
      const raw = (p.get('tier') || '').toLowerCase() as TierKey;
      const info = TIERS[raw] ?? TIERS.individual;
      this.tier.set(info);
      const list = Array.from({ length: info.travellers }, () => blank());

      // Prefill the primary traveller from the logged-in account.
      const user = this.auth.user();
      if (user) {
        list[0] = {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          fillLater: false,
        };
      }
      this.travellers.set(list);
    });
  }

  travellerLabel(i: number) {
    if (i === 0) return this.auth.isLoggedIn() ? 'Primary member · You' : 'Primary member';
    if (this.tier().key === 'duo') return 'Covered traveller';
    return `Covered traveller · ${i + 1}`;
  }

  /** The primary member's name/email are locked to the logged-in account. */
  lockPrimary(i: number) {
    return i === 0 && this.auth.isLoggedIn();
  }

  private validEmail(e: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }

  /** Primary contact details all present and the email well-formed. */
  primaryComplete() {
    const p = this.travellers()[0];
    return !!(p && p.firstName && p.lastName && p.email && p.phone && this.validEmail(p.email));
  }

  /** Email is verified — trusted automatically for a logged-in account. */
  isEmailVerified() {
    const p = this.travellers()[0];
    if (!p) return false;
    if (this.lockPrimary(0)) return true;
    return !!p.email && this.emailVerified() && this.verifiedEmail() === p.email;
  }

  /** Once the primary contact fields are filled, prompt for verification (once). */
  onPrimaryBlur(i: number) {
    if (i !== 0 || this.lockPrimary(0) || this.otpPrompted) return;
    if (!this.primaryComplete() || this.isEmailVerified()) return;
    this.otpPrompted = true;
    this.openVerify();
  }

  /** Send (or resend) a one-time code and open the verification dialog. */
  openVerify() {
    const p = this.travellers()[0];
    if (!p || !this.validEmail(p.email)) {
      this.errorMessage.set('Enter a valid email address for the primary member first.');
      return;
    }
    this.errorMessage.set('');
    this.otpCode.set(String(Math.floor(100000 + Math.random() * 900000)));
    this.otpEntry = '';
    this.otpError.set('');
    this.otpOpen.set(true);
  }

  closeOtp() {
    this.otpOpen.set(false);
  }

  confirmOtp() {
    if (this.otpEntry.trim() === this.otpCode()) {
      this.emailVerified.set(true);
      this.verifiedEmail.set(this.travellers()[0].email);
      this.otpError.set('');
      this.otpOpen.set(false);
    } else {
      this.otpError.set('That code is incorrect. Please check and try again.');
    }
  }

  toggleFillLater(i: number) {
    const list = [...this.travellers()];
    list[i] = { ...list[i], fillLater: !list[i].fillLater };
    this.travellers.set(list);
  }

  laterCount = computed(() => this.travellers().filter((t, i) => i > 0 && t.fillLater).length);

  renewalDate = computed(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  });

  formatMoney(n: number) {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);
  }

  onSubmit(e: Event) {
    e.preventDefault();
    this.errorMessage.set('');

    const primary = this.travellers()[0];
    if (!primary.firstName || !primary.lastName || !primary.email || !primary.phone) {
      this.errorMessage.set('Please complete the primary member details (first name, last name, email, phone).');
      return;
    }
    if (!this.isEmailVerified()) {
      this.errorMessage.set('Please verify your email address before paying.');
      this.openVerify();
      return;
    }
    if (!this.agreed) {
      this.errorMessage.set('Please agree to the Prime membership terms before paying.');
      return;
    }

    this.status.set('processing');
    setTimeout(() => {
      // Completing the join activates Prime on the logged-in account, so member
      // fares apply to the member's next flight booking.
      if (this.auth.isLoggedIn()) {
        this.auth.subscribe(this.tier().key);
      }
      this.status.set('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  }
}
