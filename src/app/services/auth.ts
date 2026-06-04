import { Injectable, computed, signal } from '@angular/core';
import { DemoUser, Member, TierKey } from '../data/membership';

const STORAGE_KEY = 'wkp_demo_user_v3';

/** ISO date (YYYY-MM-DD) offset from today by a number of whole months. */
function isoMonthsFromToday(months: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + months);
  return d.toISOString().slice(0, 10);
}

const PRIMARY_TRAVELLER: Member = {
  firstName: 'Gbolahan', lastName: 'Shobande', email: 'gbolahans@wakanow.com', phone: '0803 333 3333', relationship: 'Account owner', isPrimary: true,
};

const PRIME_USER: DemoUser = {
  id: 'prime-1',
  firstName: 'Gbolahan',
  lastName: 'Shobande',
  email: 'gbolahans@wakanow.com',
  phone: '0803 333 3333',
  isPrime: true,
  tier: 'duo',
  memberNo: 'WP-2481 0093',
  status: 'active',
  memberSince: isoMonthsFromToday(-3),
  renewsOn: isoMonthsFromToday(9),
  // Currently on the plan (Duo covers 2 → 1 free slot to demo "Add traveller").
  members: [PRIMARY_TRAVELLER],
  // Saved-traveller address book the "Add traveller" dropdown draws from.
  savedTravellers: [
    PRIMARY_TRAVELLER,
    { firstName: 'Amara', lastName: 'Shobande', email: 'amara.shobande@gmail.com', phone: '0803 444 4444', relationship: 'Spouse', isPrimary: false },
    { firstName: 'Tobi', lastName: 'Shobande', email: 'tobi.shobande@gmail.com', phone: '0803 555 5555', relationship: 'Child', isPrimary: false },
    { firstName: 'Zara', lastName: 'Shobande', email: 'zara.shobande@gmail.com', phone: '0803 666 6666', relationship: 'Child', isPrimary: false },
  ],
};

const NON_MEMBER_USER: DemoUser = {
  id: 'guest-1',
  firstName: 'Egwuatu',
  lastName: 'Tochi',
  email: 'tochie@wakanow.com',
  phone: '0803 333 3333',
  isPrime: false,
};

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<DemoUser | null>(this.load());

  readonly isLoggedIn = computed(() => this.user() !== null);
  readonly isPrime = computed(() => this.user()?.isPrime === true);

  loginAsPrime(): void {
    this.setUser(structuredClone(PRIME_USER));
  }

  loginAsNonMember(): void {
    this.setUser(structuredClone(NON_MEMBER_USER));
  }

  logout(): void {
    this.user.set(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }

  updateUser(patch: Partial<DemoUser>): void {
    const current = this.user();
    if (!current) return;
    this.setUser({ ...current, ...patch });
  }

  setMembers(members: Member[]): void {
    this.updateUser({ members });
  }

  setSavedTravellers(savedTravellers: Member[]): void {
    this.updateUser({ savedTravellers });
  }

  /** Turn the current (logged-in) non-member into an active Prime member on a tier. */
  subscribe(tier: TierKey): void {
    const u = this.user();
    if (!u) return;
    const memberNo = 'WP-' + Math.floor(1000 + Math.random() * 8999) + ' ' + Math.floor(1000 + Math.random() * 8999);
    const primary: Member = {
      firstName: u.firstName, lastName: u.lastName, email: u.email, phone: u.phone,
      relationship: 'Account owner', isPrimary: true,
    };
    this.updateUser({
      isPrime: true,
      tier,
      status: 'active',
      memberNo,
      memberSince: isoMonthsFromToday(0),
      renewsOn: isoMonthsFromToday(12),
      members: [primary],
      savedTravellers: u.savedTravellers ?? [primary],
      pendingTier: undefined,
    });
  }

  /** Immediate tier change (used by the prorated upgrade flow after payment). */
  changeTier(tier: TierKey): void {
    this.updateUser({ tier, status: 'active', pendingTier: undefined });
  }

  /** Schedule a tier change to take effect on the renewal date. */
  schedulePendingTier(tier: TierKey): void {
    this.updateUser({ pendingTier: tier });
  }

  cancelPendingTier(): void {
    this.updateUser({ pendingTier: undefined });
  }

  cancelMembership(): void {
    this.updateUser({ status: 'cancelled' });
  }

  resumeMembership(): void {
    this.updateUser({ status: 'active' });
  }

  private setUser(user: DemoUser): void {
    this.user.set(user);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } catch {
      /* ignore */
    }
  }

  private load(): DemoUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as DemoUser) : null;
    } catch {
      return null;
    }
  }
}
