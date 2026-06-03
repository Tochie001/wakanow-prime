import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { PrimeMark } from '../prime-mark/prime-mark';
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
  prorate,
} from '../../data/membership';

const blankMember = (): Member => ({
  firstName: '', lastName: '', email: '', phone: '', relationship: 'Family', isPrimary: false,
});

type TravellerMode = 'new' | 'edit' | 'add-existing';

@Component({
  selector: 'app-prime-panel',
  imports: [FormsModule, PrimeMark],
  styleUrl: './prime-panel.css',
  template: `
@if (tier(); as t) {
  <div class="pp">

    <!-- MEMBERSHIP CARD -->
    <section class="pp-sub-wrap">
      <div class="pp-card-black" [class.is-off]="!isActive()">
        <span class="ppc-watermark"><app-prime-mark /></span>
        <div class="ppc-top">
          <span class="ppc-brand"><app-prime-mark /><b>WAKAPRIME</b></span>
          <span class="ppc-tier">{{ t.name }}</span>
        </div>
        <div class="ppc-name">{{ user()?.firstName }} {{ user()?.lastName }}</div>
        <div class="ppc-bottom">
          <div class="ppc-field">
            <span class="ppc-lbl">Member no.</span>
            <span class="ppc-val">{{ user()?.memberNo }}</span>
          </div>
          <div class="ppc-field">
            <span class="ppc-lbl">Member since</span>
            <span class="ppc-val">{{ monthYear(user()?.memberSince) }}</span>
          </div>
          <span class="ppc-status" [class.is-off]="!isActive()">
            <span class="ppc-dot"></span>{{ isActive() ? 'Active' : 'Cancelled' }}
          </span>
        </div>
      </div>

      <div class="pp-meta">
        <div class="pp-meta-item">
          <span class="pp-meta-lbl">Annual fee</span>
          <span class="pp-meta-val">{{ formatMoney(t.price) }}</span>
        </div>
        <div class="pp-meta-item">
          <span class="pp-meta-lbl">{{ isActive() ? 'Renews on' : 'Access ends' }}</span>
          <span class="pp-meta-val">{{ formatDate(user()?.renewsOn) }}</span>
        </div>
        <div class="pp-meta-item">
          <span class="pp-meta-lbl">Registered travellers</span>
          <span class="pp-meta-val">{{ memberCount() }} of {{ t.travellers }}</span>
        </div>
      </div>

      @if (!isActive()) {
        <div class="pp-notice">
          Your membership is cancelled and won't renew. You keep Prime benefits until
          <strong>{{ formatDate(user()?.renewsOn) }}</strong>.
          <button type="button" class="pp-btn pp-btn-primary pp-btn-sm" (click)="resume()">Resume membership</button>
        </div>
      }
    </section>

    <!-- PLAN DETAILS -->
    <section class="pp-card">
      <span class="pp-eyebrow">Plan details</span>
      <h3 class="pp-h3">What's included in {{ t.name }}</h3>
      <ul class="pp-benefits">
        @for (b of t.benefits; track b) {
          <li>{{ b }}</li>
        }
      </ul>
    </section>

    <!-- MEMBERS -->
    <section class="pp-card">
      <div class="pp-card-head">
        <div>
          <span class="pp-eyebrow">Members of my Prime</span>
          <h3 class="pp-h3">Registered travellers</h3>
        </div>
        @if (canAddMember()) {
          <div class="pp-add">
            <button type="button" class="pp-btn pp-btn-outline pp-btn-sm" (click)="toggleAddMenu()">+ Add traveller</button>
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

      <ul class="pp-members">
        @for (m of members(); track $index; let i = $index) {
          <li class="pp-member" [class.is-clickable]="true" (click)="openEdit(i)">
            <span class="pp-member-avatar">{{ memberInitials(m) }}</span>
            <span class="pp-member-info">
              <strong>
                {{ m.firstName }} {{ m.lastName }}
                @if (m.isPrimary) { <span class="pp-tag-you">You</span> }
              </strong>
              <small>{{ m.relationship }}@if (m.email) { · {{ m.email }} }</small>
            </span>
            @if (!m.isPrimary) {
              <button type="button" class="pp-member-remove" (click)="removeMember(i, $event)" aria-label="Remove traveller">Remove</button>
            } @else {
              <span class="pp-member-owner">Primary</span>
            }
          </li>
        }
      </ul>
      <p class="pp-hint">{{ t.travellers - memberCount() }} traveller slot{{ (t.travellers - memberCount()) === 1 ? '' : 's' }} remaining on your {{ t.name }} plan.</p>
    </section>

    <!-- CHANGE PLAN -->
    <section class="pp-card">
      <span class="pp-eyebrow">Manage subscription</span>
      <h3 class="pp-h3">Upgrade your plan</h3>
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
    </section>

    <!-- DANGER -->
    <section class="pp-card pp-danger">
      <div>
        <h3 class="pp-h3">{{ isActive() ? 'Cancel membership' : 'Membership cancelled' }}</h3>
        <p class="pp-muted">
          @if (isActive()) {
            Cancelling stops the next renewal. You'll keep Prime pricing until {{ formatDate(user()?.renewsOn) }}.
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
    </section>
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
            <label class="pp-fld"><span>First name</span><input type="text" [(ngModel)]="draft.firstName" /></label>
            <label class="pp-fld"><span>Last name</span><input type="text" [(ngModel)]="draft.lastName" /></label>
            <label class="pp-fld"><span>Email</span><input type="email" [(ngModel)]="draft.email" placeholder="you@example.com" /></label>
            <label class="pp-fld"><span>Phone number</span><input type="tel" [(ngModel)]="draft.phone" placeholder="+234 …" /></label>
            @if (!draft.isPrimary) {
              <label class="pp-fld pp-fld-wide"><span>Relationship</span><input type="text" [(ngModel)]="draft.relationship" placeholder="e.g. Spouse, Child" /></label>
            }
          </div>
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
}
  `,
})
export class PrimePanel {
  private auth = inject(AuthService);

  user = this.auth.user;
  formatMoney = formatMoney;
  formatDate = formatDate;
  paymentOptions = PAYMENT_OPTIONS;

  tier = computed<TierInfo | null>(() => {
    const key = this.user()?.tier;
    return key ? TIERS[key] : null;
  });

  members = computed<Member[]>(() => this.user()?.members ?? []);
  memberCount = computed(() => this.members().length);
  isActive = computed(() => this.user()?.status !== 'cancelled');

  canAddMember = computed(() => {
    const t = this.tier();
    return !!t && this.memberCount() < t.travellers;
  });

  // Current plan plus any higher tiers you can upgrade to (no downgrades/switches).
  planChoices = computed(() => {
    const current = this.tier();
    if (!current) return [];
    return TIER_ORDER.map((k) => TIERS[k]).filter((p) => p.price >= current.price);
  });

  availableSaved = computed<Member[]>(() => {
    const onPlan = new Set(this.members().map((m) => this.key(m)));
    return (this.user()?.savedTravellers ?? []).filter((s) => !onPlan.has(this.key(s)));
  });

  // ----- Add / edit traveller modal -----
  travellerOpen = signal(false);
  travellerMode = signal<TravellerMode>('new');
  travellerError = signal('');
  private editIndex = signal<number>(-1);
  draft: Member = blankMember();
  addMenuOpen = signal(false);

  toggleAddMenu() {
    this.addMenuOpen.update((v) => !v);
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
    this.draft = { ...this.members()[index] };
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
      this.travellerError.set('Please enter the traveller\'s first and last name.');
      return;
    }
    const entry: Member = { ...this.draft };
    const mode = this.travellerMode();

    if (mode === 'edit') {
      const idx = this.editIndex();
      const members = this.members().map((m, i) => (i === idx ? entry : m));
      this.auth.setMembers(members);
      this.syncSaved(entry);
    } else {
      // 'new' or 'add-existing' — add to the plan.
      this.auth.setMembers([...this.members(), entry]);
      this.syncSaved(entry);
    }
    this.travellerOpen.set(false);
  }

  /** Keep the address book in sync: update a matching entry or append a new one. */
  private syncSaved(entry: Member) {
    const saved = this.user()?.savedTravellers ?? [];
    const idx = saved.findIndex((s) => this.key(s) === this.key(entry));
    const next = idx >= 0 ? saved.map((s, i) => (i === idx ? entry : s)) : [...saved, entry];
    this.auth.setSavedTravellers(next);
  }

  removeMember(index: number, e: Event) {
    e.stopPropagation();
    const list = this.members();
    if (index <= 0 || index >= list.length) return;
    if (!confirm(`Remove ${list[index].firstName} ${list[index].lastName} from your Prime plan?`)) return;
    this.auth.setMembers(list.filter((_, i) => i !== index));
  }

  // ----- Upgrade (immediate, prorated, paid now) -----
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

  // ----- Lifecycle / misc -----
  unsubscribe() {
    if (!confirm('Are you sure you want to cancel your WakaPrime membership?')) return;
    this.auth.cancelMembership();
  }

  resume() {
    this.auth.resumeMembership();
  }

  memberInitials(m: Member) {
    return `${m.firstName.charAt(0)}${m.lastName.charAt(0)}`.toUpperCase();
  }

  /** ISO date → "MAR 2026" for the membership card. */
  monthYear(iso?: string) {
    if (!iso) return '—';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }).toUpperCase();
  }

  private key(m: Member) {
    return `${m.firstName}|${m.lastName}|${m.email}`.toLowerCase();
  }
}
