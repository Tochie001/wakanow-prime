import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface Tier {
  id: 'ind' | 'duo' | 'fam';
  route: 'individual' | 'duo' | 'family';
  name: string;
  subName?: string;
  position: string;
  price: string;
  benefits: string[];
  cta: string;
  popular?: boolean;
}

@Component({
  selector: 'app-tiers',
  imports: [RouterLink],
  template: `
    <section class="tiers" id="tiers">
      <div class="container">
        <header class="section-head">
          <span class="eyebrow eyebrow-dark">CHOOSE YOUR PRIME</span>
          <h2>Three tiers. One annual price. Real savings every trip.</h2>
        </header>

        <div class="tier-grid">
          @for (tier of tiers; track tier.id) {
            <article class="tier-card" [class.tier-popular]="tier.popular">
              @if (tier.popular) {
                <div class="tier-flag">Most Popular</div>
              }
              <header class="tier-head">
                <h3>{{ tier.name }} @if (tier.subName) {<span class="tier-sub-name">{{ tier.subName }}</span>}</h3>
                <p class="tier-position">{{ tier.position }}</p>
              </header>
              <div class="tier-price">
                <span class="amount">{{ tier.price }}</span>
                <span class="cycle">/ year</span>
              </div>
              <ul class="tier-benefits">
                @for (b of tier.benefits; track b) { <li>{{ b }}</li> }
              </ul>
              <a [routerLink]="['/join', tier.route]" class="btn tier-cta" [class.btn-primary]="tier.popular" [class.btn-outline]="!tier.popular">{{ tier.cta }}</a>
            </article>
          }
        </div>
      </div>
    </section>
  `,
})
export class Tiers {
  tiers: Tier[] = [
    {
      id: 'ind',
      route: 'individual',
      name: 'Individual',
      position: 'Built for one frequent traveller who wants member prices every time they book.',
      price: '₦350,000',
      benefits: [
        'Member-only fares',
        'Priority support',
        'Early access to travel deals',
        'Visa Fast Track',
      ],
      cta: 'Join Individual',
    },
    {
      id: 'duo',
      route: 'duo',
      name: 'Duo',
      subName: '(You + Me)',
      position: 'Two registered travellers sharing Prime pricing and faster support.',
      price: '₦600,000',
      benefits: [
        'Everything in Individual plus:',
        'Two registered travellers',
        'Joint trip-planning support',
      ],
      cta: 'Join Duo',
      popular: true,
    },
    {
      id: 'fam',
      route: 'family',
      name: 'Family',
      position: 'A household plan for families who book flights, hotels and packages together.',
      price: '₦1,000,000',
      benefits: [
        'Everything in Duo plus:',
        'Four registered travellers',
        'Family-rate hotel and package offers',
      ],
      cta: 'Join Family',
    },
  ];
}
