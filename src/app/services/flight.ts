import { Injectable, computed, inject, signal } from '@angular/core';
import { ADDONS, FLIGHTS, Flight } from '../data/flights';
import { AuthService } from './auth';

export type FareType = 'full' | 'prime' | 'pss';

const STORAGE_KEY = 'wkp_flight_sel';

interface StoredSelection {
  flightId: string | null;
  fare: FareType;
  memberAtSelection: boolean;
  addOns: string[];
}

@Injectable({ providedIn: 'root' })
export class FlightService {
  private auth = inject(AuthService);

  // Mock search query (no search screen in this build).
  readonly query = {
    fromCode: 'LHR', fromCity: 'London',
    toCode: 'LOS', toCity: 'Lagos',
    departDate: 'Thu, 11 Jun', returnDate: 'Sat, 20 Jun',
    tripType: 'Round trip',
    adults: 1,
    cabin: 'Economy',
  };

  readonly flights = FLIGHTS;
  readonly addOnCatalog = ADDONS;

  readonly selectedFlightId = signal<string | null>(null);
  readonly selectedFare = signal<FareType>('full');
  /**
   * Whether the user was an active Prime member at the moment they selected this
   * flight. Member (discounted) fares apply only when this is true — so a booking
   * started as a non-member stays full fare even if they join Prime later; the
   * discount lands on their *next* booking.
   */
  readonly memberAtSelection = signal(false);
  readonly addOns = signal<Set<string>>(new Set(ADDONS.filter((a) => a.preselected).map((a) => a.id)));

  readonly selected = computed<Flight | null>(() =>
    this.flights.find((f) => f.id === this.selectedFlightId()) ?? null,
  );

  readonly addOnsTotal = computed(() =>
    this.addOnCatalog.filter((a) => this.addOns().has(a.id)).reduce((s, a) => s + a.price, 0),
  );

  constructor() {
    this.restore();
  }

  /** Choose a flight + fare from the results page. */
  select(flightId: string, fare: FareType): void {
    this.selectedFlightId.set(flightId);
    this.selectedFare.set(fare);
    this.memberAtSelection.set(this.auth.isPrime());
    this.persist();
  }

  toggleAddOn(id: string): void {
    const next = new Set(this.addOns());
    next.has(id) ? next.delete(id) : next.add(id);
    this.addOns.set(next);
    this.persist();
  }

  hasAddOn(id: string): boolean {
    return this.addOns().has(id);
  }

  reset(): void {
    this.selectedFlightId.set(null);
    this.selectedFare.set('full');
    this.memberAtSelection.set(false);
    this.addOns.set(new Set(ADDONS.filter((a) => a.preselected).map((a) => a.id)));
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  private persist(): void {
    const data: StoredSelection = {
      flightId: this.selectedFlightId(),
      fare: this.selectedFare(),
      memberAtSelection: this.memberAtSelection(),
      addOns: [...this.addOns()],
    };
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* ignore */
    }
  }

  private restore(): void {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as StoredSelection;
      this.selectedFlightId.set(d.flightId);
      this.selectedFare.set(d.fare ?? 'full');
      this.memberAtSelection.set(!!d.memberAtSelection);
      if (Array.isArray(d.addOns)) this.addOns.set(new Set(d.addOns));
    } catch {
      /* ignore */
    }
  }
}
