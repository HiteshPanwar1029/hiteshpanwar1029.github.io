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
    desc: 'Data structures and algorithms, data science and analytics, and AI for IIoT. In summer 2022 I interned at Dysmech, where I modelled telemetry from cold-chain freight units and set up 11 logistics KPIs for SLA breaches, transit delays and capacity use.',
    carry: 'Engineering fundamentals'
  },
  {
    kicker: 'PHASE 02 · APPLICATION — 2023–2025',
    title: 'Analyst, Data Science — Dysmech, India',
    desc: 'I worked with manufacturing and operations teams on process improvement. I built AWS data pipelines that fed sensor data into Power BI dashboards, and added anomaly detection and wear prediction models that cut client running costs by 15% ($120K+ a year). I also led a computer vision project from requirements to a live QA pipeline, which cut the defect escape rate by 60%, and trained 15+ operations staff to run the new systems.',
    carry: 'Real operations data and real stakeholders'
  },
  {
    kicker: 'PHASE 03 · MSC — 2025–2026',
    title: 'MSc Management — UCD Smurfit',
    desc: 'I did the MSc to learn the business side: supply chains, global strategy, and AI and business analytics. I came first in my class in the Littlefield operations simulation, reaching 97.4% of the maximum possible revenue, and sat on the Smurfit Case Competition Committee. Alongside the degree I studied the EU AI Act and GDPR using the IAPP AIGP and CIPP/E material.',
    carry: 'The business side, and the rules around AI'
  },
  {
    kicker: 'PHASE 04 · BUILDING & EVALUATING — 2026–PRESENT',
    title: 'Building AI tools and evaluating AI models',
    desc: 'I build my own tools with Claude Code: a job search automation, a PowerPoint add-in that changes slides by voice, and two study apps. Since late 2025 I have also been checking AI model outputs for accuracy, bias and reasoning, first at RWS Group and now at Outlier.',
    carry: 'Hands-on experience with AI tools',
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
