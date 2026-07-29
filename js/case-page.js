/* ============================================================
   case-page.js — entry point for individual case-study and
   project pages (case-studies/*.html, projects/*.html).

   Reuses the shared modules: scroll.js gives the progress bar,
   frosted sticky nav, scroll-reveal and the mobile menu;
   cursor-glow.js gives the pointer glow; counters.js animates
   the outcome numbers on project pages. There is no loader on
   subpages — content is readable immediately.
   ============================================================ */

import { initScroll } from './scroll.js?v=7';
import { initCursorGlow } from './cursor-glow.js?v=7';
import { initCounters } from './counters.js?v=7';
import { INTRO_SEEN_KEY } from './loader.js?v=7';
import { initAnalytics } from './analytics.js?v=7';

function init() {
  // Visiting any subpage counts as having "seen" the site intro, so
  // clicking the name in the nav goes straight to the home page
  // without replaying the hero loader.
  try { sessionStorage.setItem(INTRO_SEEN_KEY, '1'); } catch { /* ignore */ }
  initScroll();
  initCursorGlow();
  initCounters();   // outcome stat count-ups on project pages
  initAnalytics();  // pageview count only — see analytics.js
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
