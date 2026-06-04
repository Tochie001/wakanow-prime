import { AfterViewInit, Component, ElementRef, OnDestroy, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth';
import {
  Member,
  PAYMENT_OPTIONS,
  TIER_ORDER,
  TIERS,
  TierInfo,
  TierKey,
  daysUntil,
  formatDate,
  formatMoney,
  initials,
  prorate,
} from '../../data/membership';
import { PrimeMark } from '../../components/prime-mark/prime-mark';

type Section = 'membership' | 'trips' | 'personal' | 'travellers' | 'documents' | 'security' | 'manage';
type TravellerMode = 'new' | 'edit' | 'add-existing';

interface NavItem {
  key: Section;
  badge: string;
  label: string;
  mark?: boolean;
  primeOnly?: boolean;
}

const blankMember = (): Member => ({
  firstName: '', lastName: '', email: '', phone: '', relationship: 'Family', isPrimary: false,
});

@Component({
  selector: 'app-profile',
  imports: [RouterLink, FormsModule, PrimeMark],
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

      <!-- SIDEBAR (scroll-spy) -->
      <aside class="pf-side">
        <span class="pf-side-title">Account</span>
        <nav class="pf-nav">
          @for (item of navItems(); track item.key) {
            <button type="button" class="pf-nav-item" [class.is-active]="active() === item.key"
                    [class.is-prime]="item.mark" (click)="scrollToSection(item.key)">
              <span class="pf-nav-badge">
                @if (item.mark) { <app-prime-mark /> } @else { {{ item.badge }} }
              </span>
              <span>{{ item.label }}</span>
            </button>
          }
        </nav>
        <button type="button" class="pf-logout" (click)="logout()">Log out</button>
      </aside>

      <!-- MAIN (single scroll) -->
      <main class="pf-main">

        <!-- MEMBERSHIP CARD (Prime, pinned at top) -->
        @if (isPrime() && tier(); as t) {
          <section class="pf-section" id="pf-membership" data-key="membership">
            <div class="pp-card-black" [class.is-off]="!isActive()">
              <span class="ppc-watermark"><app-prime-mark /></span>
              <div class="ppc-top">
                <span class="ppc-brand"><app-prime-mark /><b>WAKAPRIME</b></span>
                <span class="ppc-tier">{{ t.name }}</span>
              </div>
              <div class="ppc-name">{{ u.firstName }} {{ u.lastName }}</div>
              <div class="ppc-bottom">
                <div class="ppc-field"><span class="ppc-lbl">Member no.</span><span class="ppc-val">{{ u.memberNo }}</span></div>
                <div class="ppc-field"><span class="ppc-lbl">Member since</span><span class="ppc-val">{{ monthYear(u.memberSince) }}</span></div>
                <span class="ppc-status" [class.is-off]="!isActive()"><span class="ppc-dot"></span>{{ isActive() ? 'Active' : 'Cancelled' }}</span>
              </div>
            </div>

            <div class="pp-meta">
              <div class="pp-meta-item"><span class="pp-meta-lbl">Annual fee</span><span class="pp-meta-val">{{ formatMoney(t.price) }}</span></div>
              <div class="pp-meta-item"><span class="pp-meta-lbl">{{ isActive() ? 'Renews on' : 'Access ends' }}</span><span class="pp-meta-val">{{ formatDate(u.renewsOn) }}</span></div>
              <div class="pp-meta-item"><span class="pp-meta-lbl">Registered travellers</span><span class="pp-meta-val">{{ memberCount() }} of {{ t.travellers }}</span></div>
            </div>

            @if (!isActive()) {
              <div class="pp-notice">
                Your membership is cancelled and won't renew. You keep Prime benefits until <strong>{{ formatDate(u.renewsOn) }}</strong>.
                <button type="button" class="pp-btn pp-btn-primary pp-btn-sm" (click)="resume()">Resume membership</button>
              </div>
            }

            <div class="pf-card">
              <span class="pf-eyebrow">Plan details</span>
              <h2>What's included in {{ t.name }}</h2>
              <ul class="pp-benefits">
                @for (b of t.benefits; track b) { <li>{{ b }}</li> }
              </ul>
            </div>
          </section>
        }

        <!-- JOIN PRIME BANNER (non-members) -->
        @if (!isPrime()) {
          <section class="pf-banner">
            <div class="pf-banner-text">
              <span class="pf-banner-eyebrow"><app-prime-mark /> WakaPrime</span>
              <h2>Unlock member-only fares and VIP travel perks</h2>
              <p>Join Prime to save on every flight, hotel and package, with priority support and a black card experience.</p>
            </div>
            <a class="pf-banner-cta" routerLink="/" fragment="tiers">Join Prime →</a>
          </section>
        }

        <!-- TRIP DETAILS -->
        <section class="pf-section" id="pf-trips" data-key="trips">
          <div class="pf-card pf-overview">
            <div class="pf-overview-text">
              <span class="pf-eyebrow">Overview</span>
              <h2>Profile completion</h2>
              <p>Keep traveller details ready so booking and manage-booking flows can prefill accurately.</p>
            </div>
            <div class="pf-overview-stats">
              <div class="pf-ring" [style.--pct]="completion()"><span>{{ completion() }}%</span></div>
              <div class="pf-stat"><strong>{{ isPrime() ? '2' : '0' }}</strong><small>Bookings</small></div>
              <div class="pf-stat"><strong>{{ travellerCount() }}</strong><small>Travellers</small></div>
              <div class="pf-stat"><strong>4</strong><small>Documents</small></div>
            </div>
          </div>
          <div class="pf-card pf-placeholder">
            <span class="pf-eyebrow">Trip details</span>
            <h2>Upcoming bookings</h2>
            <p>Bookings attached to this profile will appear here, with route, status, payment and document readiness.</p>
          </div>
        </section>

        <!-- PERSONAL INFORMATION -->
        <section class="pf-section" id="pf-personal" data-key="personal">
          <div class="pf-card">
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
          </div>
        </section>

        <!-- TRAVELLERS -->
        <section class="pf-section" id="pf-travellers" data-key="travellers">
          <div class="pf-card">
            <div class="pf-card-head">
              <div>
                <span class="pf-eyebrow">{{ isPrime() ? 'Members of my Prime' : 'Saved travellers' }}</span>
                <h2>Travellers</h2>
              </div>
              @if (canAddTraveller()) {
                <div class="pp-add">
                  <button type="button" class="pp-btn pp-btn-outline pp-btn-sm" (click)="onAddClick()">+ Add traveller</button>
                  @if (addMenuOpen()) {
                    <div class="pp-menu" role="menu">
                      <span class="pp-menu-label">From your travellers</span>
                      @for (s of availableSaved(); track $index) {
                        <button type="button" class="pp-menu-item" (click)="pickExisting(s)">
                          <span class="pp-menu-avatar">{{ memberInitials(s) }}</span>
                          <span class="pp-menu-text"><strong>{{ s.firstName }} {{ s.lastName }}</strong><small>{{ s.relationship }}</small></span>
                        </button>
                      }
                      @if (availableSaved().length === 0) {
                        <span class="pp-menu-empty">No other saved travellers.</span>
                      }
                      <button type="button" class="pp-menu-item pp-menu-new" (click)="openNew()">
                        <span class="pp-menu-avatar pp-menu-avatar-add">+</span>
                        <span class="pp-menu-text"><strong>Add new traveller</strong><small>Enter their details</small></span>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>

            @if (travellerList().length) {
              <ul class="pp-members">
                @for (m of travellerList(); track $index; let i = $index) {
                  <li class="pp-member is-clickable" (click)="openEdit(i)">
                    <span class="pp-member-avatar">{{ memberInitials(m) }}</span>
                    <span class="pp-member-info">
                      <strong>
                        {{ m.firstName }} {{ m.lastName }}
                        @if (m.isPrimary) { <span class="pp-tag-you">You</span> }
                      </strong>
                      <small>{{ m.relationship }}@if (m.email) { · {{ m.email }} }</small>
                    </span>
                    @if (!m.isPrimary) {
                      <button type="button" class="pp-member-remove" (click)="removeTraveller(i, $event)" aria-label="Remove traveller">Remove</button>
                    } @else {
                      <span class="pp-member-owner">Primary</span>
                    }
                  </li>
                }
              </ul>
            } @else {
              <p class="pf-placeholder-inline">No saved travellers yet. Add the people you usually travel with so booking is faster.</p>
            }

            @if (isPrime() && tier(); as t) {
              <p class="pp-hint">{{ t.travellers - memberCount() }} traveller slot{{ (t.travellers - memberCount()) === 1 ? '' : 's' }} remaining on your {{ t.name }} plan.</p>
            }
          </div>
        </section>

        <!-- TRAVEL DOCUMENTS -->
        <section class="pf-section" id="pf-documents" data-key="documents">
          <div class="pf-card pf-placeholder">
            <span class="pf-eyebrow">Travel documents</span>
            <h2>Travel documents</h2>
            <p>Passports, visas and IDs you save will live here for faster checkout. Nothing saved in this demo yet.</p>
          </div>
        </section>

        <!-- SECURITY -->
        <section class="pf-section" id="pf-security" data-key="security">
          <div class="pf-card pf-placeholder">
            <span class="pf-eyebrow">Security</span>
            <h2>Security</h2>
            <p>Password, two-factor authentication and active sessions. Nothing to manage in this demo yet.</p>
          </div>
        </section>

        <!-- MANAGE PLAN (Prime, last) -->
        @if (isPrime() && tier(); as t) {
          <section class="pf-section" id="pf-manage" data-key="manage">
            <div class="pf-card">
              <span class="pf-eyebrow">Manage subscription</span>
              <h2>Upgrade your plan</h2>
              <p class="pp-muted">Move up to a higher plan instantly. You only pay the prorated difference and your new benefits apply right away.</p>
              <div class="pp-plans">
                @for (p of planChoices(); track p.key) {
                  <div class="pp-plan" [class.is-current]="p.key === t.key">
                    <div class="pp-plan-info">
                      <strong>{{ p.name }}</strong>
                      <small>{{ formatMoney(p.price) }} / year · {{ p.travellers }} traveller{{ p.travellers === 1 ? '' : 's' }}</small>
                    </div>
                    @if (p.key === t.key) {
                      <span class="pp-pill pp-pill-current">Current plan</span>
                    } @else {
                      <button type="button" class="pp-btn pp-btn-primary pp-btn-sm" (click)="openUpgrade(p.key)">Upgrade</button>
                    }
                  </div>
                }
              </div>
              @if (planChoices().length === 1) {
                <p class="pp-hint">You're on our highest plan. There's nothing higher to upgrade to.</p>
              }
            </div>

            <div class="pf-card pp-danger">
              <div>
                <h2>{{ isActive() ? 'Cancel membership' : 'Membership cancelled' }}</h2>
                <p class="pp-muted">
                  @if (isActive()) {
                    Cancelling stops the next renewal. You'll keep Prime pricing until {{ formatDate(u.renewsOn) }}.
                  } @else {
                    Your plan won't renew. Resume any time to keep your benefits.
                  }
                </p>
              </div>
              @if (isActive()) {
                <button type="button" class="pp-btn pp-btn-danger" (click)="unsubscribe()">Unsubscribe</button>
              } @else {
                <button type="button" class="pp-btn pp-btn-primary" (click)="resume()">Resume</button>
              }
            </div>
          </section>
        }
      </main>

    </div>
  </div>

  <!-- TRAVELLER MODAL -->
  @if (travellerOpen()) {
    <div class="pp-overlay" (click)="closeTraveller()">
      <div class="pp-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <header class="pp-modal-head">
          <h3>{{ travellerMode() === 'edit' ? 'Traveller details' : 'Add traveller' }}</h3>
          <button type="button" class="pp-modal-x" (click)="closeTraveller()" aria-label="Close">×</button>
        </header>
        <div class="pp-modal-body">
          <div class="pp-form-grid">
            <label class="pp-fld" [class.is-locked]="draft.isPrimary"><span>First name</span><input type="text" [(ngModel)]="draft.firstName" [readonly]="draft.isPrimary" /></label>
            <label class="pp-fld" [class.is-locked]="draft.isPrimary"><span>Last name</span><input type="text" [(ngModel)]="draft.lastName" [readonly]="draft.isPrimary" /></label>
            <label class="pp-fld" [class.is-locked]="draft.isPrimary"><span>Email</span><input type="email" [(ngModel)]="draft.email" placeholder="you@example.com" [readonly]="draft.isPrimary" /></label>
            <label class="pp-fld"><span>Phone number</span><input type="tel" [(ngModel)]="draft.phone" placeholder="+234 …" /></label>
            @if (!draft.isPrimary) {
              <label class="pp-fld pp-fld-wide"><span>Relationship</span><input type="text" [(ngModel)]="draft.relationship" placeholder="e.g. Spouse, Child" /></label>
            }
          </div>
          @if (draft.isPrimary) {
            <p class="pp-form-note">Your name and email are linked to your WakaPrime account and can only be changed once a year. You can still update your phone number here.</p>
          }
          @if (travellerError()) { <p class="pp-form-error">{{ travellerError() }}</p> }
        </div>
        <footer class="pp-modal-foot">
          <button type="button" class="pp-btn pp-btn-outline" (click)="closeTraveller()">Cancel</button>
          <button type="button" class="pp-btn pp-btn-primary" (click)="saveTraveller()">
            {{ travellerMode() === 'edit' ? 'Save changes' : 'Save traveller' }}
          </button>
        </footer>
      </div>
    </div>
  }

  <!-- UPGRADE MODAL -->
  @if (upgradeTarget(); as ut) {
    <div class="pp-overlay" (click)="closeUpgrade()">
      <div class="pp-modal" (click)="$event.stopPropagation()" role="dialog" aria-modal="true">
        <header class="pp-modal-head">
          <h3>Upgrade to {{ ut.name }}</h3>
          <button type="button" class="pp-modal-x" (click)="closeUpgrade()" aria-label="Close">×</button>
        </header>
        <div class="pp-modal-body">
          <p class="pp-modal-lead">Upgrade now and your new benefits apply immediately. You only pay the prorated difference for the {{ daysLeft() }} days left in your cycle.</p>
          <div class="pp-prorate">
            <div class="pp-prorate-row"><span>{{ ut.name }} vs {{ tier()?.name }}</span><span>{{ formatMoney(ut.price - (tier()?.price || 0)) }}/yr</span></div>
            <div class="pp-prorate-row"><span>Days remaining</span><span>{{ daysLeft() }} of 365</span></div>
            <div class="pp-prorate-row pp-prorate-total"><span>Prorated balance due now</span><strong>{{ formatMoney(prorateDue()) }}</strong></div>
          </div>
          <span class="pp-eyebrow pp-eyebrow-tight">Payment method</span>
          <div class="pp-pay">
            @for (opt of paymentOptions; track opt.id) {
              <label class="pp-pay-opt" [class.is-selected]="payMethod() === opt.id">
                <input type="radio" name="ppPay" [value]="opt.id" [checked]="payMethod() === opt.id" (change)="payMethod.set(opt.id)" />
                <span class="pp-pay-radio" aria-hidden="true"><span class="dot"></span></span>
                <span class="pp-pay-text"><strong>{{ opt.label }}</strong><small>{{ opt.hint }}</small></span>
              </label>
            }
          </div>
        </div>
        <footer class="pp-modal-foot">
          <button type="button" class="pp-btn pp-btn-outline" (click)="closeUpgrade()">Cancel</button>
          <button type="button" class="pp-btn pp-btn-primary" (click)="payUpgrade()" [disabled]="paying()">
            @if (paying()) { Processing… } @else { Pay {{ formatMoney(prorateDue()) }} now }
          </button>
        </footer>
      </div>
    </div>
  }
</div>
}
  `,
})
export class ProfilePage implements AfterViewInit, OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);

  user = this.auth.user;
  isPrime = this.auth.isPrime;
  initials = initials;
  formatMoney = formatMoney;
  formatDate = formatDate;
  paymentOptions = PAYMENT_OPTIONS;

  active = signal<Section>('trips');

  private baseNav: NavItem[] = [
    { key: 'membership', badge: '★', label: 'Prime membership', mark: true, primeOnly: true },
    { key: 'trips', badge: 'T', label: 'Trip details' },
    { key: 'personal', badge: 'P', label: 'Personal information' },
    { key: 'travellers', badge: 'A', label: 'Travellers' },
    { key: 'documents', badge: 'D', label: 'Travel documents' },
    { key: 'security', badge: 'S', label: 'Security' },
    { key: 'manage', badge: '★', label: 'Manage plan', mark: true, primeOnly: true },
  ];

  navItems = computed(() => this.baseNav.filter((i) => !i.primeOnly || this.isPrime()));

  tierName = computed(() => {
    const key = this.user()?.tier;
    return key ? TIERS[key].name : '';
  });

  tier = computed<TierInfo | null>(() => {
    const key = this.user()?.tier;
    return key ? TIERS[key] : null;
  });

  travellerList = computed<Member[]>(() =>
    this.isPrime() ? (this.user()?.members ?? []) : (this.user()?.savedTravellers ?? []),
  );
  memberCount = computed(() => this.travellerList().length);
  travellerCount = computed(() => this.travellerList().length);
  isActive = computed(() => this.user()?.status !== 'cancelled');
  completion = computed(() => (this.isPrime() ? 80 : 0));

  canAddTraveller = computed(() => {
    if (!this.isPrime()) return true;
    const t = this.tier();
    return !!t && this.travellerList().length < t.travellers;
  });

  planChoices = computed(() => {
    const current = this.tier();
    if (!current) return [];
    return TIER_ORDER.map((k) => TIERS[k]).filter((p) => p.price >= current.price);
  });

  availableSaved = computed<Member[]>(() => {
    const onList = new Set(this.travellerList().map((m) => this.key(m)));
    return (this.user()?.savedTravellers ?? []).filter((s) => !onList.has(this.key(s)));
  });

  // ----- Scroll-spy -----
  private observer?: IntersectionObserver;

  ngAfterViewInit() {
    const sections = this.host.nativeElement.querySelectorAll<HTMLElement>('.pf-section');
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            const key = (e.target as HTMLElement).dataset['key'] as Section | undefined;
            if (key) this.active.set(key);
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: 0 },
    );
    sections.forEach((s) => this.observer!.observe(s));
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  scrollToSection(key: Section) {
    this.active.set(key);
    this.host.nativeElement.querySelector('#pf-' + key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // ----- Travellers -----
  travellerOpen = signal(false);
  travellerMode = signal<TravellerMode>('new');
  travellerError = signal('');
  private editIndex = signal<number>(-1);
  draft: Member = blankMember();
  addMenuOpen = signal(false);

  onAddClick() {
    if (this.isPrime()) this.addMenuOpen.update((v) => !v);
    else this.openNew();
  }

  openNew() {
    this.draft = blankMember();
    this.travellerMode.set('new');
    this.travellerError.set('');
    this.addMenuOpen.set(false);
    this.travellerOpen.set(true);
  }

  pickExisting(s: Member) {
    this.draft = { ...s };
    this.travellerMode.set('add-existing');
    this.travellerError.set('');
    this.addMenuOpen.set(false);
    this.travellerOpen.set(true);
  }

  openEdit(index: number) {
    this.draft = { ...this.travellerList()[index] };
    this.editIndex.set(index);
    this.travellerMode.set('edit');
    this.travellerError.set('');
    this.travellerOpen.set(true);
  }

  closeTraveller() {
    this.travellerOpen.set(false);
  }

  saveTraveller() {
    if (!this.draft.firstName.trim() || !this.draft.lastName.trim()) {
      this.travellerError.set("Please enter the traveller's first and last name.");
      return;
    }
    const entry: Member = { ...this.draft };
    const list = this.travellerList();
    const next =
      this.travellerMode() === 'edit'
        ? list.map((m, i) => (i === this.editIndex() ? entry : m))
        : [...list, entry];
    this.writeTravellers(next);
    if (this.isPrime()) this.syncSaved(entry);
    this.travellerOpen.set(false);
  }

  removeTraveller(index: number, e: Event) {
    e.stopPropagation();
    const list = this.travellerList();
    const m = list[index];
    if (!m || m.isPrimary) return;
    if (!confirm(`Remove ${m.firstName} ${m.lastName} from your travellers?`)) return;
    this.writeTravellers(list.filter((_, i) => i !== index));
  }

  private writeTravellers(list: Member[]) {
    if (this.isPrime()) this.auth.setMembers(list);
    else this.auth.setSavedTravellers(list);
  }

  /** Keep the address book in sync (Prime only): update a matching entry or append. */
  private syncSaved(entry: Member) {
    const saved = this.user()?.savedTravellers ?? [];
    const idx = saved.findIndex((s) => this.key(s) === this.key(entry));
    const next = idx >= 0 ? saved.map((s, i) => (i === idx ? entry : s)) : [...saved, entry];
    this.auth.setSavedTravellers(next);
  }

  // ----- Upgrade -----
  upgradeKey = signal<TierKey | null>(null);
  upgradeTarget = computed(() => (this.upgradeKey() ? TIERS[this.upgradeKey()!] : null));
  payMethod = signal<string>(PAYMENT_OPTIONS[0].id);
  paying = signal(false);

  daysLeft = computed(() => daysUntil(this.user()?.renewsOn));
  prorateDue = computed(() => {
    const cur = this.tier();
    const tgt = this.upgradeTarget();
    if (!cur || !tgt) return 0;
    return prorate(cur.price, tgt.price, this.user()?.renewsOn);
  });

  openUpgrade(key: TierKey) {
    this.payMethod.set(PAYMENT_OPTIONS[0].id);
    this.upgradeKey.set(key);
  }
  closeUpgrade() {
    this.upgradeKey.set(null);
  }
  payUpgrade() {
    const key = this.upgradeKey();
    if (!key) return;
    this.paying.set(true);
    setTimeout(() => {
      this.auth.changeTier(key);
      this.paying.set(false);
      this.upgradeKey.set(null);
    }, 1200);
  }

  // ----- Membership lifecycle -----
  unsubscribe() {
    if (!confirm('Are you sure you want to cancel your WakaPrime membership?')) return;
    this.auth.cancelMembership();
  }
  resume() {
    this.auth.resumeMembership();
  }

  // ----- Misc -----
  memberInitials(m: Member) {
    return `${m.firstName.charAt(0)}${m.lastName.charAt(0)}`.toUpperCase();
  }

  monthYear(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
  }

  private key(m: Member) {
    return `${m.firstName}|${m.lastName}|${m.email}`.toLowerCase();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
