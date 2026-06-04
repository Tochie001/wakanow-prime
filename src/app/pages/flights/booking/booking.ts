import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FlightService } from '../../../services/flight';
import { AuthService } from '../../../services/auth';
import { primeFare } from '../../../data/flights';
import { formatMoney } from '../../../data/membership';
import { PrimeMark } from '../../../components/prime-mark/prime-mark';

const SERVICE_CHARGE = 8_665;

@Component({
  selector: 'app-flight-booking',
  imports: [FormsModule, RouterLink, PrimeMark],
  styleUrl: './booking.css',
  template: `
@if (flight(); as f) {
  @if (status() === 'success') {
    <section class="bk-success">
      <div class="bk-container bk-success-inner">
        <div class="bk-success-check" aria-hidden="true">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h1>Booking confirmed</h1>
        <p>Your {{ f.airlineName }} trip {{ q.fromCode }} → {{ q.toCode }} is booked. A confirmation has been sent to <strong>{{ contact.email || 'your email' }}</strong>.</p>
        <div class="bk-success-meta">
          <div><span>Booking reference</span><strong>{{ bookingRef() }}</strong></div>
          <div><span>Total paid</span><strong>{{ money(total()) }}</strong></div>
        </div>
        <div class="bk-success-cta">
          <a routerLink="/flights" class="bk-btn bk-btn-outline" (click)="flights.reset()">Book another flight</a>
          @if (auth.isPrime()) { <a routerLink="/profile" class="bk-btn bk-btn-primary">View my membership</a> }
        </div>
      </div>
    </section>
  } @else {
    <div class="bk">
      <div class="bk-container bk-grid">

        <main class="bk-main">
          <h1 class="bk-h1">Your booking</h1>

          <!-- 1 · BOOKING SUMMARY -->
          <section class="bk-card">
            <div class="bk-step"><span class="bk-num">1</span><h2>Booking summary</h2></div>
            <div class="bk-flight-head">
              <span class="bk-air-logo">{{ f.initials }}</span>
              <div>
                <strong>{{ q.fromCode }} → {{ q.toCode }} · {{ f.airlineName }}</strong>
                <small>{{ q.tripType }} · {{ q.adults }} traveller</small>
              </div>
            </div>
            @for (leg of [f.out, f.ret]; track leg.dir) {
              <div class="bk-leg">
                <div class="bk-leg-tag" [class.is-return]="leg.dir === 'Return'">{{ leg.dir }} · {{ leg.date }}</div>
                <div class="bk-leg-row">
                  <div class="bk-pt"><strong>{{ leg.depTime }}</strong><span>{{ leg.depCode }}</span></div>
                  <div class="bk-leg-mid"><span>{{ leg.duration }}</span><div class="bk-leg-line"></div><span class="bk-leg-stops">{{ leg.stops === 0 ? 'Direct' : leg.stopLabel }}</span></div>
                  <div class="bk-pt bk-pt-r"><strong>{{ leg.arrTime }}</strong><span>{{ leg.arrCode }}</span></div>
                </div>
              </div>
            }
            <div class="bk-rules">
              <div><span class="bk-rule-k">Change fee</span><span>Applies before departure</span></div>
              <div><span class="bk-rule-k">Cancellation</span><span [class.bad]="!f.refundable">{{ f.refundable ? 'Refundable (penalty)' : 'Non-refundable' }}</span></div>
              <div><span class="bk-rule-k">Baggage</span><span>{{ f.checkedBag }} included</span></div>
            </div>
          </section>

          <!-- 2 · TRAVELLER DETAILS -->
          <section class="bk-card">
            <div class="bk-step"><span class="bk-num">2</span><h2>Traveller details</h2></div>
            @if (!auth.isLoggedIn()) {
              <p class="bk-login-hint">Have an account? <a routerLink="/login" [queryParams]="{ returnUrl: '/flights/booking' }">Log in for faster checkout</a></p>
            }

            <h3 class="bk-sub">Contact information</h3>
            <div class="bk-fields">
              <label class="bk-field" [class.is-locked]="lock()"><span>Email address</span><input type="email" [(ngModel)]="contact.email" name="email" placeholder="you@example.com" [readonly]="lock()" /></label>
              <label class="bk-field"><span>Phone number</span><input type="tel" [(ngModel)]="contact.phone" name="phone" placeholder="+234 …" /></label>
            </div>

            <h3 class="bk-sub">Lead traveller</h3>
            <p class="bk-passport-note">Enter names <strong>exactly as on the passport</strong>; this is used for the ticket.</p>
            <div class="bk-fields bk-fields-3">
              <label class="bk-field"><span>Title</span><input type="text" [(ngModel)]="lead.title" name="title" placeholder="Mr / Mrs / Ms" /></label>
              <label class="bk-field" [class.is-locked]="lock()"><span>First name</span><input type="text" [(ngModel)]="lead.firstName" name="fn" placeholder="As on passport" [readonly]="lock()" /></label>
              <label class="bk-field" [class.is-locked]="lock()"><span>Last name</span><input type="text" [(ngModel)]="lead.lastName" name="ln" placeholder="As on passport" [readonly]="lock()" /></label>
              <label class="bk-field"><span>Date of birth</span><input type="text" [(ngModel)]="lead.dob" name="dob" placeholder="DD / MM / YYYY" /></label>
              <label class="bk-field"><span>Gender</span><input type="text" [(ngModel)]="lead.gender" name="gender" placeholder="Male / Female" /></label>
              <label class="bk-field"><span>Nationality</span><input type="text" [(ngModel)]="lead.nationality" name="nat" placeholder="Nigeria" /></label>
            </div>
            @if (!auth.isLoggedIn()) {
              <label class="bk-consent"><input type="checkbox" [(ngModel)]="createProfile" name="cp" /><span>Create a profile for me — save details for faster checkout and track bookings.</span></label>
            }
            <label class="bk-consent"><input type="checkbox" [(ngModel)]="agreed" name="agreed" /><span>I have read and accept the <a href="#" (click)="$event.preventDefault()">Terms & Conditions</a> and Privacy Policy.</span></label>
          </section>

          <!-- 3 · ENHANCE YOUR TRIP -->
          <section class="bk-card">
            <div class="bk-step"><span class="bk-num">3</span><h2>Enhance your trip</h2><span class="bk-step-note">All add-ons are optional</span></div>
            <div class="bk-addons">
              @for (a of flights.addOnCatalog; track a.id) {
                <div class="bk-addon" [class.is-on]="flights.hasAddOn(a.id)">
                  <div class="bk-addon-text"><strong>{{ a.name }}</strong><small>{{ a.desc }}</small></div>
                  <div class="bk-addon-act">
                    <span class="bk-addon-price">{{ money(a.price) }}</span>
                    <button type="button" class="bk-addon-btn" [class.is-remove]="flights.hasAddOn(a.id)" (click)="flights.toggleAddOn(a.id)">
                      {{ flights.hasAddOn(a.id) ? '− Remove' : '+ Add' }}
                    </button>
                  </div>
                </div>
              }
            </div>
          </section>

          <!-- SLIM JOIN-PRIME NUDGE (non-members) -->
          @if (!auth.isPrime()) {
            <section class="bk-card bk-join-nudge">
              <div class="bk-join-text">
                <span class="bk-join-eyebrow"><app-prime-mark /> WakaPrime</span>
                <strong>Join Prime and save {{ money(savings()) }} on your next trip</strong>
                <small>This booking is at the full fare. Subscribe now and member fares apply from your next booking.</small>
              </div>
              <a class="bk-btn bk-btn-primary" routerLink="/" fragment="tiers">Join Prime</a>
            </section>
          }

          <!-- 4 · PAYMENT -->
          <section class="bk-card">
            <div class="bk-step"><span class="bk-num">4</span><h2>Payment</h2></div>
            @if (payError()) { <p class="bk-error">{{ payError() }}</p> }
            <button type="button" class="bk-btn bk-btn-primary bk-btn-lg bk-btn-block" [disabled]="status() === 'processing'" (click)="pay()">
              @if (status() === 'processing') { Processing… } @else { Pay {{ money(total()) }} }
            </button>
          </section>
        </main>

        <!-- PRICE SUMMARY -->
        <aside class="bk-summary">
          <div class="bk-summary-inner">
            <div class="bk-hold">Price held for {{ countdown() }}</div>
            <div class="bk-sum-flight">
              <span class="bk-air-logo bk-air-logo-sm">{{ f.initials }}</span>
              <div><strong>{{ q.fromCode }} → {{ q.toCode }}</strong><small>{{ f.airlineName }}</small></div>
            </div>
            <dl class="bk-sum-list">
              <div><dt>Flights × {{ q.adults }} traveller</dt><dd>{{ money(grossFares()) }}</dd></div>
              @if (savedShown() > 0) {
                <div class="bk-sum-discount"><dt><app-prime-mark /> Prime member discount</dt><dd>−{{ money(savedShown()) }}</dd></div>
              }
              <div><dt>Taxes &amp; fees</dt><dd>{{ money(taxes()) }}</dd></div>
              <div><dt>Service charge</dt><dd>{{ money(serviceCharge) }}</dd></div>
            </dl>
            @if (selectedAddOns().length) {
              <div class="bk-sum-addons">
                <span class="bk-sum-addons-h">Add-ons</span>
                @for (a of selectedAddOns(); track a.id) {
                  <div class="bk-sum-addon"><dt>{{ a.name }}</dt><dd>{{ money(a.price) }}</dd></div>
                }
              </div>
            }
            <div class="bk-sum-total"><span>Total</span><strong>{{ money(total()) }}</strong></div>
          </div>
        </aside>

      </div>
    </div>
  }
} @else {
  <div class="bk-empty">
    <p>No flight selected.</p>
    <a routerLink="/flights" class="bk-btn bk-btn-primary">Search flights</a>
  </div>
}
  `,
})
export class FlightBookingPage implements OnDestroy {
  flights = inject(FlightService);
  auth = inject(AuthService);
  private router = inject(Router);

  q = this.flights.query;
  money = formatMoney;
  serviceCharge = SERVICE_CHARGE;

  flight = this.flights.selected;
  status = signal<'idle' | 'processing' | 'success'>('idle');
  payError = signal('');
  bookingRef = signal('WK-' + Math.floor(100000 + Math.random() * 899999));

  contact = { email: '', phone: '' };
  lead = { title: '', firstName: '', lastName: '', dob: '', gender: '', nationality: '' };
  createProfile = true;
  agreed = false;

  private timer: ReturnType<typeof setInterval>;
  private seconds = signal(895);
  countdown = computed(() => {
    const s = this.seconds();
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  });

  constructor() {
    if (!this.flights.selected()) {
      this.router.navigate(['/flights']);
    }
    const u = this.auth.user();
    if (u) {
      this.contact.email = u.email;
      this.contact.phone = u.phone;
      this.lead.firstName = u.firstName;
      this.lead.lastName = u.lastName;
    }
    this.timer = setInterval(() => {
      this.seconds.update((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
  }

  ngOnDestroy() {
    clearInterval(this.timer);
  }

  lock() {
    return this.auth.isLoggedIn();
  }

  /**
   * Member (discounted) fares apply only when the booking was STARTED as a Prime
   * member (memberAtSelection) and the member fare was picked. A non-member's
   * booking stays full fare — the discount lands on their next booking.
   */
  private memberFareApplies = computed(() =>
    this.flights.memberAtSelection() && this.flights.selectedFare() === 'prime',
  );

  private farePerPax = computed(() => {
    const f = this.flight();
    if (!f) return 0;
    return this.memberFareApplies() ? primeFare(f.fullFare) : f.fullFare;
  });
  faresTotal = computed(() => this.farePerPax() * this.q.adults);
  // Gross (full) fare before any Prime discount, shown as the headline fares line.
  grossFares = computed(() => {
    const f = this.flight();
    return f ? f.fullFare * this.q.adults : 0;
  });
  taxes = computed(() => Math.round(this.faresTotal() * 0.06));
  selectedAddOns = computed(() => this.flights.addOnCatalog.filter((a) => this.flights.hasAddOn(a.id)));
  total = computed(() =>
    this.faresTotal() + this.taxes() + this.serviceCharge + this.flights.addOnsTotal(),
  );

  savings = computed(() => {
    const f = this.flight();
    return f ? (f.fullFare - primeFare(f.fullFare)) * this.q.adults : 0;
  });
  // The discount line is shown only when the member fare is actually applied.
  savedShown = computed(() => (this.memberFareApplies() ? this.savings() : 0));

  canPay() {
    return (
      !!this.contact.email.trim() &&
      !!this.lead.firstName.trim() &&
      !!this.lead.lastName.trim() &&
      this.agreed
    );
  }

  pay() {
    if (!this.canPay()) {
      this.payError.set('Please complete contact details, the lead traveller name and accept the terms.');
      return;
    }
    this.payError.set('');
    this.status.set('processing');
    setTimeout(() => {
      this.status.set('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1400);
  }
}
