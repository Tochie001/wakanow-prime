import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Tiers } from '../../components/tiers/tiers';
import { PrimeMark } from '../../components/prime-mark/prime-mark';

type TierId = 'ind' | 'duo' | 'fam';

@Component({
  selector: 'app-home',
  imports: [FormsModule, Tiers, PrimeMark],
  template: `
<div class="page-v2">

  <!-- ============================================================
       HERO — Dark navy with the original copy + flight card
       ============================================================ -->
  <section class="v2-hero">
    <div class="v2-container">
      <div class="v2-hero-grid">
        <div class="v2-hero-text">
          <span class="v2-pill">WakaPrime</span>
          <h1 class="v2-display">
            Access <em>member–only</em><br/>
            travel discounts<br/>
            in one checkout.
          </h1>
          <p class="v2-lede">
            Prime brings lower eligible fares, priority support and registered traveller perks into one annual membership for frequent Wakanow customers.
          </p>
          <div class="v2-cta">
            <a class="v2-btn-orange" href="#tiers" (click)="scrollToId('tiers', $event)">Join Prime</a>
          </div>
        </div>

        <div class="hero-card" aria-hidden="true">
          <div class="hc-row hc-top">
            <div class="hc-airline">
              <div class="hc-avatar">RA</div>
              <div>
                <div class="hc-name">Royal Air Maroc</div>
                <div class="hc-flight">AT554 + AT800</div>
              </div>
            </div>
          </div>

          <div class="hc-fares">
            <div class="fare">
              <div class="fare-label">FULL PAY</div>
              <div class="fare-price">₦1,340,936</div>
              <div class="fare-sub">Pay once · total fare</div>
            </div>
            <div class="fare fare-prime is-active">
              <div class="fare-label"><span class="fare-prime-pill"><app-prime-mark class="fare-prime-star" /> PRIME</span></div>
              <div class="fare-price">₦900,000</div>
              <div class="fare-sub">Members only · save ₦440,936</div>
            </div>
          </div>

          <div class="hc-route">
            <div class="hc-leg">
              <div class="hc-leg-label">Depart</div>
              <div class="hc-time">07:05</div>
              <div class="hc-iata">LOS</div>
            </div>
            <div class="hc-mid">
              <div class="hc-duration">9h 45m</div>
              <div class="hc-line"></div>
              <div class="hc-stops">1 stop · CMN</div>
            </div>
            <div class="hc-leg hc-leg-right">
              <div class="hc-leg-label">Arrive</div>
              <div class="hc-time">16:50</div>
              <div class="hc-iata">LHR</div>
            </div>
          </div>

          <div class="hc-tags">
            <span class="tag">Economy</span>
            <span class="tag">1 × 7kg cabin</span>
            <span class="tag">1 × 23kg checked</span>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- ============================================================
       TIERS — Three cards with vertical feature card
       ============================================================ -->
  <app-tiers />

  <!-- ============================================================
       PERKS — Elite service experience (editorial portrait cards)
       ============================================================ -->
  <section class="v2-perks">
    <div class="v2-container">
      <header class="v2-perks-header">
        <div class="v2-perks-text">
          <h2 class="v2-h2">Discover our <em>elite service</em> experience</h2>
          <p>Every WakaPrime member enjoys comprehensive travel assistance from start to finish. Explore our remarkable offerings.</p>
        </div>
        <div class="v2-perks-nav" (mouseenter)="pauseAutoScroll()" (mouseleave)="resumeAutoScroll()">
          <button type="button" class="v2-perks-arr" (click)="scrollPerks(-1)" [disabled]="atStart()" aria-label="Previous">‹</button>
          <button type="button" class="v2-perks-arr" (click)="scrollPerks(1)" [disabled]="atEnd()" aria-label="Next">›</button>
        </div>
      </header>

      <div class="v2-perks-strip"
           #perksStrip
           (scroll)="onPerksScroll()"
           (mouseenter)="pauseAutoScroll()"
           (mouseleave)="resumeAutoScroll()"
           (touchstart)="pauseAutoScroll()"
           (touchend)="resumeAutoScroll()">

        <article class="v2-perk v2-perk-card-frame" style="background-image: url('/prime-card.png');">
          <div class="v2-perk-panel">
            <h3>Black Card Access</h3>
            <p>A borderless travel card that supports you wherever you are.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('https://images.unsplash.com/photo-1530521954074-e64f6810b32d?w=900&q=80&auto=format&fit=crop');">
          <div class="v2-perk-panel">
            <h3>VIP Lounge Services</h3>
            <p>Enjoy complimentary refreshments, high-speed Wi-Fi, and service that caters to your every need.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('/premium-support.png');">
          <div class="v2-perk-panel">
            <h3>24/7 Travel Concierge</h3>
            <p>Comprehensive concierge support from start to finish, making your journey a breeze.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=900&q=80&auto=format&fit=crop');">
          <div class="v2-perk-panel">
            <h3>Seamless Flight Booking</h3>
            <p>Experience the future of travel — every journey tailored to your desires and dreams.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=900&q=80&auto=format&fit=crop');">
          <div class="v2-perk-panel">
            <h3>Prompt Hotel Reservations</h3>
            <p>Seamless hotel reservations, where every stay is tailored to your needs.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=900&q=80&auto=format&fit=crop');">
          <div class="v2-perk-panel">
            <h3>Efficient Airport Transfers</h3>
            <p>On-time arrivals and smooth rides with our trusted ground partners.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('/visa-concierge.png');">
          <div class="v2-perk-panel">
            <h3>Visa Concierge</h3>
            <p>Schengen, UK, US, Canada — handled by our dedicated visa team.</p>
          </div>
        </article>

        <article class="v2-perk" style="background-image: url('/vip.jpg');">
          <div class="v2-perk-panel">
            <h3>Lifestyle Experiences</h3>
            <p>Curated dining, events and lifestyle perks through our exclusive partner network.</p>
          </div>
        </article>

      </div>
    </div>
  </section>

  <!-- ============================================================
       CALCULATOR — Annotated card
       HIDDEN: wrapped in @if (showCalc) so it stays in source.
       To bring back, flip showCalc to true in home.ts.
       ============================================================ -->
  @if (showCalc) {
  <section class="v2-calc">
    <div class="v2-container">
      <div class="v2-calc-grid">
        <div class="v2-calc-text">
          <div class="v2-eyebrow"><span class="dash"></span>Do the math</div>
          <h2 class="v2-h2">Find out what Prime <em>gives back.</em></h2>
          <p>The math is honest. Tell us how you travel and we'll show you exactly when your membership starts paying for itself.</p>
          <div class="v2-calc-rules">
            <div><span>01</span> 12% saving on international fares</div>
            <div><span>02</span> 7% saving on domestic fares</div>
            <div><span>03</span> Visa Fast Track + concierge included</div>
          </div>
        </div>

        <form class="v2-calc-card" (submit)="$event.preventDefault()" novalidate>
          <div class="vcc-annotation vcc-a-top">your trips <span>→</span></div>

          <label class="vcc-field">
            <span>International trips per year</span>
            <input type="number" min="0" max="50" [(ngModel)]="intlTrips" name="intl" />
          </label>
          <label class="vcc-field">
            <span>Domestic trips per year</span>
            <input type="number" min="0" max="50" [(ngModel)]="domTrips" name="dom" />
          </label>
          <label class="vcc-field">
            <span>Average spend per trip (₦)</span>
            <input type="number" min="0" step="10000" [(ngModel)]="avgSpend" name="spend" />
          </label>
          <label class="vcc-field">
            <span>Compare against tier</span>
            <select [(ngModel)]="tier" name="tier">
              <option value="ind">Individual — ₦350K</option>
              <option value="duo">Duo — ₦600K</option>
              <option value="fam">Family — ₦1M</option>
            </select>
          </label>

          <div class="vcc-result">
            <div class="vcc-result-label">— Your saving</div>
            <div class="vcc-result-amount">{{ formatted() }}</div>
            <div class="vcc-result-foot">{{ note() }}</div>
            <a class="v2-btn v2-btn-primary vcc-cta" routerLink="." fragment="tiers">Start saving <span class="arr">→</span></a>
          </div>

          <div class="vcc-annotation vcc-a-bottom"><span>←</span> your saving</div>
        </form>
      </div>
    </div>
  </section>
  }

  <!-- ============================================================
       HOW IT WORKS — Numbered editorial
       ============================================================ -->
  <section class="v2-how" id="how">
    <div class="v2-container">
      <header class="v2-section-head v2-section-head-left">
        <div class="v2-eyebrow"><span class="dash"></span>Getting started</div>
        <h2 class="v2-h2"><em>Three steps</em> to your first saving.</h2>
      </header>

      <ol class="v2-steps">
        <li>
          <span class="num">01</span>
          <h3>Choose your tier</h3>
          <p>Individual, Duo or Family — pick the plan that matches how you travel.</p>
        </li>
        <li>
          <span class="num">02</span>
          <h3>Get member discounts</h3>
          <p>Prime pricing applies automatically to eligible flights, hotels and packages.</p>
        </li>
        <li>
          <span class="num">03</span>
          <h3>Renew once a year</h3>
          <p>Benefits roll over, your registered travellers stay on the plan.</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- ============================================================
       STORIES — One dominant pull quote
       ============================================================ -->
  <section class="v2-stories">
    <div class="v2-container">
      <header class="v2-section-head">
        <div class="v2-eyebrow"><span class="dash"></span>Member stories</div>
        <h2 class="v2-h2">"Worth it on <em>the first ticket.</em>"</h2>
      </header>

      <div class="v2-stories-grid">
        <figure class="v2-story v2-story-main">
          <blockquote>
            <span class="quote-mark">"</span>
            Booked LOS-LHR for the family in December. Prime paid for itself on the first ticket — and we got upgraded support the whole way.
          </blockquote>
          <figcaption>
            <span class="who">Adaeze O.</span>
            <span class="where">Family member · Lagos</span>
          </figcaption>
        </figure>

        <div class="v2-stories-side">
          <figure class="v2-story">
            <blockquote>"The member fares alone covered the Duo plan by my second trip — my wife uses it too."</blockquote>
            <figcaption>
              <span class="who">Kunle B.</span>
              <span class="where">Duo member · Houston</span>
            </figcaption>
          </figure>
          <figure class="v2-story">
            <blockquote>"Visa Fast Track was the unexpected win. Schengen sorted in days, not weeks."</blockquote>
            <figcaption>
              <span class="who">Chiamaka N.</span>
              <span class="where">Individual · Abuja</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       FAQ — Always-open, minimal lines
       ============================================================ -->
  <section class="v2-faq">
    <div class="v2-container">
      <div class="v2-faq-grid">
        <header class="v2-section-head v2-section-head-left">
          <div class="v2-eyebrow"><span class="dash"></span>FAQ</div>
          <h2 class="v2-h2">Asked &amp;<br/><em>answered.</em></h2>
        </header>

        <div class="v2-faq-list">
          @for (item of faqs; track item.q) {
            <div class="v2-faq-item">
              <h4>{{ item.q }}</h4>
              <p>{{ item.a }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  </section>

  <!-- ============================================================
       FINAL CTA — Single line, dominant
       ============================================================ -->
  <section class="v2-final">
    <div class="v2-container">
      <h2 class="v2-final-headline">Pay once. <em>Save all year.</em></h2>
      <p class="v2-final-sub">Three tiers, one promise. Your first trip will already pay you back.</p>
      <div class="v2-cta v2-cta-center">
        <a class="v2-btn v2-btn-primary v2-btn-lg v2-btn-square" href="#tiers" (click)="scrollToId('tiers', $event)">Join WakaPrime <span class="arr">→</span></a>
      </div>
    </div>
  </section>

</div>
  `,
})
export class Home implements AfterViewInit, OnDestroy {
  // Calculator visibility toggle — flip to true to bring the section back
  showCalc = false;

  // Perks carousel
  @ViewChild('perksStrip') perksStrip!: ElementRef<HTMLElement>;
  atStart = signal(true);
  atEnd = signal(false);

  // Auto-scroll
  private autoScrollTimer?: ReturnType<typeof setInterval>;
  private autoScrollPaused = false;
  private readonly AUTO_SCROLL_MS = 2000;

  ngAfterViewInit() {
    queueMicrotask(() => {
      this.onPerksScroll();
      this.startAutoScroll();
    });
  }

  ngOnDestroy() {
    this.stopAutoScroll();
  }

  private startAutoScroll() {
    if (typeof window === 'undefined') return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    this.autoScrollTimer = setInterval(() => {
      if (this.autoScrollPaused) return;
      const el = this.perksStrip?.nativeElement;
      if (!el) return;
      const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
      if (atEnd) {
        el.scrollTo({ left: 0, behavior: 'smooth' });
      } else {
        this.scrollPerks(1);
      }
    }, this.AUTO_SCROLL_MS);
  }

  private stopAutoScroll() {
    if (this.autoScrollTimer) {
      clearInterval(this.autoScrollTimer);
      this.autoScrollTimer = undefined;
    }
  }

  pauseAutoScroll() { this.autoScrollPaused = true; }
  resumeAutoScroll() { this.autoScrollPaused = false; }

  scrollToId(id: string, e?: Event) {
    e?.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  scrollPerks(dir: -1 | 1) {
    const el = this.perksStrip?.nativeElement;
    if (!el) return;
    const card = el.querySelector('.v2-perk') as HTMLElement | null;
    const step = card ? card.offsetWidth + 24 /* gap */ : el.clientWidth * 0.8;
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  }

  onPerksScroll() {
    const el = this.perksStrip?.nativeElement;
    if (!el) return;
    this.atStart.set(el.scrollLeft <= 1);
    this.atEnd.set(el.scrollLeft + el.clientWidth >= el.scrollWidth - 1);
  }

  // Calculator state — same model as v1 calculator
  intlTrips = signal(3);
  domTrips = signal(2);
  avgSpend = signal(800_000);
  tier = signal<TierId>('duo');

  private prices: Record<TierId, number> = { ind: 350_000, duo: 600_000, fam: 1_000_000 };
  private labels: Record<TierId, string> = { ind: 'Individual', duo: 'Duo', fam: 'Family' };
  private rates = { intl: 0.12, dom: 0.07 };
  private fmt = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

  private num(v: unknown, fb = 0) {
    const n = typeof v === 'number' ? v : parseFloat(String(v));
    return Number.isFinite(n) && n >= 0 ? n : fb;
  }

  private gross = computed(() => {
    const intl = this.num(this.intlTrips()),
          dom = this.num(this.domTrips()),
          spend = this.num(this.avgSpend());
    return intl * spend * this.rates.intl + dom * spend * this.rates.dom;
  });

  private net = computed(() => Math.max(0, this.gross() - this.prices[this.tier()]));
  formatted = computed(() => this.fmt.format(Math.round(this.net())));

  note = computed(() => {
    const intl = this.num(this.intlTrips()),
          dom = this.num(this.domTrips()),
          spend = this.num(this.avgSpend());
    const totalTrips = intl + dom;
    if (totalTrips === 0 || spend === 0) return 'Enter your trips to see your payback.';
    const fee = this.prices[this.tier()];
    const gross = this.gross();
    if (gross >= fee) {
      const perTrip = gross / Math.max(1, totalTrips);
      const tripsToPayback = Math.max(1, Math.ceil(fee / Math.max(perTrip, 1)));
      return `Prime ${this.labels[this.tier()]} pays back in your first ${tripsToPayback === 1 ? 'trip' : tripsToPayback + ' trips'}.`;
    }
    const shortfall = fee - gross;
    return `You're ${this.fmt.format(Math.round(shortfall))} short of breaking even — add another trip or try a smaller tier.`;
  });

  faqs = [
    { q: 'How does Prime work?', a: "Pay your annual membership once and member-only pricing applies automatically at checkout on eligible flights, hotels and packages — for every registered traveller on your tier." },
    { q: 'Can I upgrade my tier?', a: "Yes. You can upgrade at any time and we'll prorate the difference against your remaining membership period." },
    { q: 'Who counts as a family member?', a: "Family covers up to four registered travellers in one household. They don't all need to travel together — each can book independently using Prime pricing." },
    { q: 'Is my membership refundable?', a: 'Memberships are non-refundable once activated, but you can downgrade or cancel auto-renewal any time before your renewal date.' },
    { q: 'How do I add or change my registered travellers?', a: 'Manage registered travellers from your Prime dashboard. You can swap a traveller once per membership year at no charge.' },
  ];
}
