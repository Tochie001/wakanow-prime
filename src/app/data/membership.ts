export type TierKey = 'individual' | 'duo' | 'family';

export interface TierInfo {
  key: TierKey;
  name: string;
  price: number;
  travellers: number;
  position: string;
  benefits: string[];
}

export const TIERS: Record<TierKey, TierInfo> = {
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

export const TIER_ORDER: TierKey[] = ['individual', 'duo', 'family'];

export interface Member {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface DemoUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isPrime: boolean;
  tier?: TierKey;
  /** Membership card number, e.g. "WP-2481 0093". */
  memberNo?: string;
  /** Travellers currently registered on the Prime plan. */
  members?: Member[];
  /** The account's saved-traveller address book (superset of members). */
  savedTravellers?: Member[];
  /** ISO date (YYYY-MM-DD). */
  memberSince?: string;
  /** ISO date (YYYY-MM-DD) of the next renewal. */
  renewsOn?: string;
  status?: 'active' | 'cancelled';
  /** A scheduled tier change that applies on the renewal date. */
  pendingTier?: TierKey;
}

export function formatMoney(n: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(n);
}

export function initials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

/** Format an ISO date (YYYY-MM-DD) as e.g. "12 Mar 2026". */
export function formatDate(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Whole days from today until the given ISO date (never negative). */
export function daysUntil(iso?: string): number {
  if (!iso) return 0;
  const target = new Date(iso).getTime();
  const now = Date.now();
  return Math.max(0, Math.ceil((target - now) / 86_400_000));
}

/**
 * Prorated amount due now to upgrade from one tier to another: the price
 * difference charged only for the days remaining in the current cycle.
 */
export function prorate(currentPrice: number, targetPrice: number, renewIso?: string): number {
  const diff = Math.max(0, targetPrice - currentPrice);
  const remaining = daysUntil(renewIso);
  return Math.round((diff * remaining) / 365);
}

export interface PaymentOption {
  id: string;
  label: string;
  hint: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  { id: 'card', label: 'Card or bank', hint: 'Debit/credit card, bank app or wallet' },
  { id: 'transfer', label: 'Bank transfer', hint: 'Pay via account number' },
  { id: 'wallet', label: 'Wakanow wallet', hint: 'Use your wallet balance' },
];
