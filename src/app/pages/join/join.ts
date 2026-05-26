import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

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
            <span class="val">Wakanow Prime — {{ tier().name }}</span>
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
          <a href="#" class="join-btn join-btn-outline">Open dashboard</a>
        </div>
      </div>
    </section>
  } @else {
    <!-- FORM STATE -->
    <section class="join-main">
      <div class="join-container join-grid">

        <form class="join-form" (submit)="onSubmit($event)" novalidate>

          <header class="join-form-head">
            <h1>Join Wakanow Prime <em>· {{ tier().name }}</em></h1>
            <p>{{ tier().position }} Fill in member details below, then choose how you'd like to pay.</p>
          </header>

          <!-- STEP 01 -->
          <div class="join-step">
            <div class="join-step-num">1</div>
            <div class="join-step-content">
              <h2>Member information</h2>
              <p class="join-step-desc">{{ tier().travellers }} registered traveller{{ tier().travellers === 1 ? '' : 's' }} are covered by this plan.</p>

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
                    }
                  </header>

                  @if (!t.fillLater || i === 0) {
                    <div class="join-fields">
                      <label class="jfield">
                        <span>First name</span>
                        <input type="text" required [(ngModel)]="t.firstName" [name]="'first-' + i" autocomplete="given-name" />
                      </label>
                      <label class="jfield">
                        <span>Last name</span>
                        <input type="text" required [(ngModel)]="t.lastName" [name]="'last-' + i" autocomplete="family-name" />
                      </label>
                      <label class="jfield">
                        <span>Email</span>
                        <input type="email" [required]="i === 0" [(ngModel)]="t.email" [name]="'email-' + i" autocomplete="email" />
                      </label>
                      <label class="jfield">
                        <span>Phone</span>
                        <input type="tel" [required]="i === 0" [(ngModel)]="t.phone" [name]="'phone-' + i" autocomplete="tel" placeholder="+234 …" />
                      </label>
                    </div>
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
                    <strong>Pay online</strong>
                    <span>Card, bank app or wallet</span>
                  </span>
                </label>

                <label class="join-pay-option" [class.is-selected]="payMethod() === 'transfer'">
                  <input type="radio" name="payMethod" value="transfer"
                         [checked]="payMethod() === 'transfer'"
                         (change)="payMethod.set('transfer')" />
                  <span class="join-pay-radio" aria-hidden="true"><span class="dot"></span></span>
                  <span class="join-pay-icon" aria-hidden="true">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M3 21h18"/>
                      <path d="M3 10h18"/>
                      <path d="m12 3 9 7H3l9-7Z"/>
                      <path d="M5 21V10"/>
                      <path d="M9 21V10"/>
                      <path d="M15 21V10"/>
                      <path d="M19 21V10"/>
                    </svg>
                  </span>
                  <span class="join-pay-text">
                    <strong>Bank transfer</strong>
                    <span>Use Prime ID as narration</span>
                  </span>
                </label>
              </div>

              <label class="join-consent">
                <input type="checkbox" [(ngModel)]="agreed" name="agreed" />
                <span>I agree to the <a href="#">Prime membership terms</a> and registered traveller policy.</span>
              </label>

              @if (errorMessage()) {
                <div class="join-error">{{ errorMessage() }}</div>
              }

              <button class="join-btn join-btn-primary join-btn-lg" type="submit" [disabled]="status() === 'processing' || !agreed">
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
              <h3>Wakanow Prime <em>{{ tier().name }}</em></h3>
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

</div>
  `,
})
export class JoinPage {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  tier = signal<TierInfo>(TIERS.individual);
  travellers = signal<Traveller[]>([blank()]);
  payMethod = signal<'online' | 'transfer'>('online');
  status = signal<'idle' | 'processing' | 'success'>('idle');
  errorMessage = signal<string>('');
  agreed = false;

  constructor() {
    this.route.paramMap.subscribe(p => {
      const raw = (p.get('tier') || '').toLowerCase() as TierKey;
      const info = TIERS[raw] ?? TIERS.individual;
      this.tier.set(info);
      this.travellers.set(Array.from({ length: info.travellers }, () => blank()));
    });
  }

  travellerLabel(i: number) {
    if (i === 0) return 'Primary member';
    if (this.tier().key === 'duo') return 'Covered traveller';
    return `Covered traveller · ${i + 1}`;
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
    if (!this.agreed) {
      this.errorMessage.set('Please agree to the Prime membership terms before paying.');
      return;
    }

    this.status.set('processing');
    setTimeout(() => {
      this.status.set('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  }
}
