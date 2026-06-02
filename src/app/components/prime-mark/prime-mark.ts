import { Component } from '@angular/core';

/**
 * The WakaPrime mark — the Wakanow kite/arrow motif (from the logo) rendered as
 * a faceted kite. Inherits `color` via `currentColor` and scales with font-size
 * (1em), so a parent sets size/colour. Use anywhere the brand mark is needed.
 */
@Component({
  selector: 'app-prime-mark',
  template: `
    <svg class="prime-mark" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 1.5 19 10 12 22.5 5 10Z" fill="currentColor" />
      <path d="M12 1.5V22.5M5 10h14" stroke="rgba(255,255,255,.4)" stroke-width="1" />
    </svg>
  `,
  styles: `:host{ display:inline-flex; line-height:0; } .prime-mark{ width:1em; height:1em; display:block; }`,
})
export class PrimeMark {}
