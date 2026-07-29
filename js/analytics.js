/* ============================================================
   analytics.js — a pageview counter, and nothing else.

   Counts how many times each page was opened. That is the whole
   feature. There is no dashboard of "users", no funnels, no
   session replay, no advertising integration, because none of
   that is wanted here.

   WHAT LEAVES YOUR BROWSER
     The path you opened (e.g. "/case-studies/mechahitler.html").
     That's it. The referrer and the page title are blanked below
     before the request is built, so they are never sent.

   WHAT IS STORED AT THE OTHER END
     A per-hour tally: path, hour, count. Collection of browser,
     operating system, country, language and screen width is
     switched off in the GoatCounter dashboard
     (Settings -> Data collection), so those tables stay empty.

   WHAT IS NOT STORED, EVER
     No IP address. No User-Agent string. No tracker ID. And
     nothing at all is written to your device — no cookies, no
     localStorage, no sessionStorage, no cache entries. Repeat
     visits are de-duplicated with a hash that lives in server
     memory for eight hours and is never written to disk.

   WHO OPERATES IT
     GoatCounter, open source (MIT), run from Ireland on servers
     in Finland and Germany. No third-party sharing. Nothing
     leaves the EU.

   AUDIT IT YOURSELF
     script  https://gc.zgo.at/count.js   (served unminified, ~3.2K)
     server  https://github.com/arp242/goatcounter
     policy  https://www.goatcounter.com/help/privacy

   LEGAL BASIS
     Nothing is stored on or read from your device, so ePrivacy
     Art. 5(3) consent is not engaged. The transient IP handling
     at the server rests on legitimate interest (GDPR Art. 6(1)(f))
     — knowing whether anyone reads this site — which is about as
     narrow as that basis gets.
   ============================================================ */

/* ------------------------------------------------------------
   SETUP — one line to fill in.

   1. Make a free account at https://www.goatcounter.com/signup
      You pick a code there; your dashboard becomes
      https://YOURCODE.goatcounter.com
   2. Put that code between the quotes below.

   Until this is filled in, this module does nothing: no script is
   loaded and no request is made. So the site is safe to ship
   either way.
   ------------------------------------------------------------ */
const SITE_CODE = 'https://hiteshpanwar.goatcounter.com/count" async src="//gc.zgo.at/count.js';

/* Send only the path. Empty strings are respected by count.js —
   only null/undefined fall back to the default, so these two
   genuinely suppress the referrer and title. */
const DATA = { referrer: '', title: '' };

export function initAnalytics() {
  if (!SITE_CODE) return;

  // Set on window as well as on the tag: count.js reads the
  // attribute and lets it override window.goatcounter, so the two
  // agreeing means we get the same result on either code path.
  window.goatcounter = { ...DATA };

  const s = document.createElement('script');
  s.async = true;
  s.src = 'https://gc.zgo.at/count.js';
  s.setAttribute('data-goatcounter', `https://${SITE_CODE}.goatcounter.com/count`);
  s.setAttribute('data-goatcounter-settings', JSON.stringify(DATA));
  document.head.appendChild(s);

  showVisitCount();
}

/* ------------------------------------------------------------
   The count, shown in the hero loader.

   Publishing the total is the point: this site argues that
   collection should be legible, and the cheapest way to prove it
   is to show the only number being collected.

   Requires "Allow adding visitor counts on your website" in the
   GoatCounter settings — off by default, because it makes the
   total publicly readable. Which here is intended.

   The special path TOTAL (case-sensitive, no leading slash) is
   the whole-site figure. Responses are cached up to four hours,
   so it lags a little; the copy says "counted so far" rather than
   anything that would imply live.
   ------------------------------------------------------------ */
async function showVisitCount() {
  const el = document.querySelector('.loader-visits');
  if (!el) return;                                   // subpages have no loader

  // The loader is skipped on repeat visits in the same tab and under
  // prefers-reduced-motion (loader.js sets .is-instant before this
  // runs). Nothing would be visible, so don't make the request.
  if (document.querySelector('.site.is-instant')) return;

  try {
    const res = await fetch(
      `https://${SITE_CODE}.goatcounter.com/counter/TOTAL.json`,
      { signal: AbortSignal.timeout(2500) },         // loader only lasts ~3s
    );
    if (!res.ok) return;

    const { count } = await res.json();              // pre-formatted, e.g. "1,247"
    if (!count) return;

    el.querySelector('.loader-visits-num').textContent = count;
    el.hidden = false;
  } catch {
    // Offline, blocked, timed out, or counts aren't public yet.
    // The line simply never appears — no error, no layout shift.
  }
}
