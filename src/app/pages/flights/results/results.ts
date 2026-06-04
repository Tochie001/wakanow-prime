import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FlightService, FareType } from '../../../services/flight';
import { AuthService } from '../../../services/auth';
import { Flight, primeFare, pssMonthly } from '../../../data/flights';
import { formatMoney } from '../../../data/membership';
import { PrimeMark } from '../../../components/prime-mark/prime-mark';

type SortKey = 'best' | 'cheapest' | 'fastest' | 'earliest';

@Component({
  selector: 'app-flight-results',
  imports: [PrimeMark, RouterLink],
  styleUrl: './results.css',
  template: `
<div class="fr">

  <!-- SEARCH SUMMARY -->
  <div class="fr-topbar">
    <div class="fr-container fr-top-inner">
      <div class="fr-route-sum">
        <strong>{{ q.fromCode }} → {{ q.toCode }}</strong>
        <span>{{ q.tripType }} · {{ q.departDate }} – {{ q.returnDate }} · {{ q.adults }} adult · {{ q.cabin }}</span>
      </div>
      <div class="fr-top-actions">
        @if (!auth.isPrime()) {
          <a class="fr-join-btn" routerLink="/" fragment="tiers"><app-prime-mark /> Join Prime</a>
        }
        <button type="button" class="fr-edit">Edit search</button>
      </div>
    </div>
  </div>

  <div class="fr-container fr-grid">

    <!-- FILTERS (presentational demo) -->
    <aside class="fr-filters" [class.is-open]="filtersOpen()">
      <div class="fr-filters-head">
        <h3>Filters</h3>
        <button type="button" class="fr-filters-close" (click)="filtersOpen.set(false)">Done</button>
      </div>
      <div class="fr-fgroup">
        <h4>Stops</h4>
        <label class="fr-check"><input type="checkbox" checked /> Direct</label>
        <label class="fr-check"><input type="checkbox" checked /> 1 stop</label>
        <label class="fr-check"><input type="checkbox" checked /> 2+ stops</label>
      </div>
      <div class="fr-fgroup">
        <h4>Departure time</h4>
        <label class="fr-check"><input type="checkbox" /> Morning</label>
        <label class="fr-check"><input type="checkbox" /> Afternoon</label>
        <label class="fr-check"><input type="checkbox" /> Evening</label>
      </div>
      <div class="fr-fgroup">
        <h4>Airlines</h4>
        @for (f of flights.flights; track f.id) {
          <label class="fr-check"><input type="checkbox" checked /> {{ f.airlineName }}</label>
        }
      </div>
      <p class="fr-fnote">Filters are illustrative in this demo.</p>
    </aside>

    <!-- RESULTS -->
    <main class="fr-main">
      <div class="fr-sortbar">
        <div class="fr-sort">
          @for (s of sorts; track s.key) {
            <button type="button" class="fr-sort-tab" [class.is-on]="sortKey() === s.key" (click)="sortKey.set(s.key)">{{ s.label }}</button>
          }
        </div>
        <div class="fr-sortbar-right">
          <span class="fr-count">{{ flights.flights.length }} flights</span>
          <button type="button" class="fr-filter-toggle" (click)="filtersOpen.set(true)">Filters</button>
        </div>
      </div>

      @if (!auth.isPrime()) {
        <div class="fr-join-banner">
          <div class="fr-join-text">
            <span class="fr-join-eyebrow"><app-prime-mark /> WakaPrime</span>
            <strong>Join Prime and pay member fares on every trip</strong>
            <span class="fr-join-sub">Members save on flights, hotels and packages. Your member fares start from your next booking.</span>
          </div>
          <a class="fr-join-cta" routerLink="/" fragment="tiers">Join Prime</a>
        </div>
      }

      @for (f of sortedFlights(); track f.id) {
        <article class="fr-card">
          <header class="fr-card-head">
            <div class="fr-airline">
              <span class="fr-air-logo">{{ f.initials }}</span>
              <div>
                <div class="fr-air-name">{{ f.airlineName }}</div>
                <div class="fr-air-code">{{ f.airlineCode }}</div>
              </div>
            </div>
            <div class="fr-book-wrap">
              @if (f.bestDeal) { <span class="fr-best">Best Deal</span> }
              <button type="button" class="fr-book" (click)="book(f)">Book Now</button>
            </div>
          </header>

          <!-- THREE FARES (responsive) -->
          <div class="fo-options" role="radiogroup" aria-label="Choose a fare">
            <button type="button" class="fo fo-full" [class.is-on]="fareOf(f.id) === 'full'" (click)="setFare(f.id, 'full')">
              <span class="fo-check" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span class="fo-head"><span class="fo-label">FULL PAY</span></span>
              <span class="fo-price">
                @if (f.wasFare) { <s>{{ money(f.wasFare) }}</s> }
                {{ money(f.fullFare) }}
              </span>
              <span class="fo-sub">Pay once · per passenger</span>
            </button>

            <button type="button" class="fo fo-prime" [class.is-on]="fareOf(f.id) === 'prime'" [class.is-locked]="!auth.isPrime()" (click)="setFare(f.id, 'prime')">
              <span class="fo-check" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span class="fo-head"><span class="fo-pill"><app-prime-mark /> PRIME</span></span>
              <span class="fo-price">{{ money(prime(f.fullFare)) }}</span>
              <span class="fo-sub">Members only fare · per passenger</span>
              @if (!auth.isPrime()) {
                <span class="fo-tip">Click Join Prime above to sign up for Prime and enjoy all Prime member benefits</span>
              }
            </button>

            <button type="button" class="fo fo-pss" [class.is-on]="fareOf(f.id) === 'pss'" (click)="setFare(f.id, 'pss')">
              <span class="fo-check" aria-hidden="true">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </span>
              <span class="fo-head"><span class="fo-label fo-label-pss">PAY SMALL SMALL</span></span>
              <span class="fo-price">{{ money(pss(f.fullFare)) }}<small>/mo</small></span>
              <span class="fo-sub">3 monthly instalments · 0% interest</span>
            </button>
          </div>

          <!-- ROUTE -->
          <div class="fr-route">
            <div class="fr-leg">
              <span class="fr-leg-dir">Depart <em>{{ f.out.date }}</em></span>
              <div class="fr-leg-times">
                <div class="fr-pt"><strong>{{ f.out.depTime }}</strong><span>{{ f.out.depCode }}</span></div>
                <div class="fr-mid"><span class="fr-dur">{{ f.out.duration }}</span><div class="fr-line"></div><span class="fr-stops">{{ f.out.stops === 0 ? 'Direct' : f.out.stopLabel }}</span></div>
                <div class="fr-pt fr-pt-r"><strong>{{ f.out.arrTime }}</strong><span>{{ f.out.arrCode }}</span></div>
              </div>
            </div>
            <div class="fr-leg">
              <span class="fr-leg-dir">Return <em>{{ f.ret.date }}</em></span>
              <div class="fr-leg-times">
                <div class="fr-pt"><strong>{{ f.ret.depTime }}</strong><span>{{ f.ret.depCode }}</span></div>
                <div class="fr-mid"><span class="fr-dur">{{ f.ret.duration }}</span><div class="fr-line"></div><span class="fr-stops">{{ f.ret.stops === 0 ? 'Direct' : f.ret.stopLabel }}</span></div>
                <div class="fr-pt fr-pt-r"><strong>{{ f.ret.arrTime }}</strong><span>{{ f.ret.arrCode }}</span></div>
              </div>
            </div>
          </div>

          <!-- FOOTER -->
          <div class="fr-foot">
            <div class="fr-tags">
              <span class="fr-tag">{{ f.cabinBag }}</span>
              <span class="fr-tag">{{ f.checkedBag }}</span>
              <span class="fr-refund" [class.ok]="f.refundable">{{ f.refundable ? 'Refundable (penalty applies)' : 'Non-refundable' }}</span>
            </div>
            <a class="fr-details" href="#" (click)="$event.preventDefault()">View flight details →</a>
          </div>
        </article>
      }
    </main>
  </div>
</div>
  `,
})
export class FlightResultsPage {
  flights = inject(FlightService);
  auth = inject(AuthService);
  private router = inject(Router);

  q = this.flights.query;
  money = formatMoney;
  prime = primeFare;
  pss = pssMonthly;

  sorts: { key: SortKey; label: string }[] = [
    { key: 'best', label: 'Best' },
    { key: 'cheapest', label: 'Cheapest' },
    { key: 'fastest', label: 'Fastest' },
    { key: 'earliest', label: 'Earliest' },
  ];
  sortKey = signal<SortKey>('best');
  filtersOpen = signal(false);

  // Per-card fare choice; defaults to Full Pay (matching the listing screenshot).
  private cardFares = signal<Record<string, FareType>>({});

  fareOf(id: string): FareType {
    return this.cardFares()[id] ?? (this.auth.isPrime() ? 'prime' : 'full');
  }
  setFare(id: string, fare: FareType) {
    // Non-members can't book the member fare — the Prime card just nudges them to join.
    if (fare === 'prime' && !this.auth.isPrime()) return;
    this.cardFares.update((m) => ({ ...m, [id]: fare }));
  }

  sortedFlights = computed<Flight[]>(() => {
    const list = [...this.flights.flights];
    switch (this.sortKey()) {
      case 'cheapest':
        return list.sort((a, b) => a.fullFare - b.fullFare);
      case 'fastest':
        return list.sort((a, b) => this.mins(a.out.duration) - this.mins(b.out.duration));
      case 'earliest':
        return list.sort((a, b) => a.out.depTime.localeCompare(b.out.depTime));
      default:
        return list;
    }
  });

  private mins(d: string): number {
    const m = d.match(/(\d+)h\s*(\d+)?/);
    return m ? Number(m[1]) * 60 + Number(m[2] || 0) : 0;
  }

  book(f: Flight) {
    this.flights.select(f.id, this.fareOf(f.id));
    this.router.navigate(['/flights/booking']);
  }
}
