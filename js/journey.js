/* ============================================================
   journey.js — "Career, plotted."

   The Trajectory section is an SVG ascent chart: four milestones
   rising from B.Tech (2019) to building and practice (now). The
   line deliberately continues past the last point as a dashed,
   unlabelled segment — the trajectory is open-ended, so there is
   no "destination" card to select.

     • the line draws itself when the chart scrolls into view
       (stroke-dashoffset transition, .is-drawn on the <svg>);
     • each point (and each mobile list item) selects a phase,
       updating the detail panel below;
     • default selection is the last phase — the section's
       resting message is what I am doing right now.

   prefers-reduced-motion: chart appears fully drawn, no pulse.
   ============================================================ */

const PHASES = [
  {
    kicker: 'PHASE 01 · FOUNDATION — 2019–2023',
    title: 'B.Tech Computer Science — GLA University',
    desc: 'Data structures, computer vision, AI for IIoT. Four years learning how these systems are actually built — which is why I can still open the model instead of just the slide deck about it.',
    carry: 'Engineering fundamentals'
  },
  {
    kicker: 'PHASE 02 · APPLICATION — 2023–2025',
    title: 'Production data science — Dysmech, Pune',
    desc: 'Where the theory met a factory floor. Computer vision quality control on live production lines: defect escapes down 60%, client running costs down 15% ($120K+ a year). Models judged against a P&L rather than a validation set — and the lesson that a wrong model isn’t a research finding, it’s an invoice.',
    carry: 'Shipped AI, measured in business numbers'
  },
  {
    kicker: 'PHASE 03 · EXPANDING THE KNOWLEDGE BASE — 2025–2026',
    title: 'MSc Management, UCD Smurfit — and the rulebook',
    desc: 'Deliberately widening the base rather than going deeper into one skill. Corporate finance, global strategy and business analytics at Smurfit for the commercial half of AI work; alongside it, studying the law that now governs it — the EU AI Act, GDPR and DPIA practice, working through the IAPP AIGP and CIPP/E material.',
    carry: 'Business case + the regulatory picture'
  },
  {
    kicker: 'PHASE 04 · BUILDING & PRACTICE — 2026–PRESENT',
    title: 'Shipping systems, and evaluating them daily',
    desc: 'Everything in Projects: an agentic job-search platform with a scheduled pipeline behind it, a voice-driven presentation navigator, two offline-first learning apps. Built and run by me, not prototyped and abandoned. Running in parallel since late 2025: reviewing frontier model outputs for accuracy, bias and reasoning quality — which is how I know where LLMs actually break.',
    carry: 'Delivery, and judgement about what to trust',
    cta: true
  }
];

export function initJourney() {
  const section = document.querySelector('.journey');
  if (!section) return;

  const chart = section.querySelector('.jchart');
  const points = Array.from(section.querySelectorAll('[data-jpt]'));
  const detail = section.querySelector('.jdetail');
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Draw-on-view ----
  if (chart) {
    if (reduce) {
      chart.classList.add('is-drawn');
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          chart.classList.add('is-drawn');
          io.disconnect();
        });
      }, { threshold: 0.35 });
      io.observe(chart);
    }
  }

  // ---- Phase selection ----
  if (!detail || points.length === 0) return;

  const el = (name) => detail.querySelector('[data-j=' + name + ']');
  const kicker = el('kicker');
  const title = el('title');
  const desc = el('desc');
  const carry = el('carry');
  const cta = el('cta');

  const select = (idx) => {
    const data = PHASES[idx];
    if (!data) return;
    points.forEach((p) => {
      const active = parseInt(p.dataset.jpt, 10) === idx;
      p.classList.toggle('is-active', active);
      p.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (kicker) kicker.textContent = data.kicker;
    if (title) title.textContent = data.title;
    if (desc) desc.textContent = data.desc;
    if (carry) carry.textContent = data.carry;
    if (cta) cta.hidden = !data.cta;
    // retrigger the swap animation
    detail.classList.remove('is-swapped');
    void detail.offsetWidth;
    detail.classList.add('is-swapped');
  };

  points.forEach((p) => {
    const idx = parseInt(p.dataset.jpt, 10);
    p.addEventListener('click', () => select(idx));
    p.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(idx); }
    });
  });

  // Default: the last phase — what I am doing now.
  select(PHASES.length - 1);
}
