/* ============================================================
   neural-network.js — the interactive skill → output diagram.

   Desktop: an SVG of 5 inputs (skills) → 4 labelled process
   stages → 4 outputs (work).
   Hovering / focusing / activating an input highlights the path it
   feeds and fires signal pulses along the edges. Output nodes are
   links that scroll to the relevant section.

   Mobile (SVG hidden via CSS): a stacked list of skill / output
   buttons drives the same mapping.

   Keyboard: input and output neurons are focusable (tabindex in the
   HTML) and respond to Enter / Space, and focusing an input traces
   its path — so the interaction works without a mouse.

   prefers-reduced-motion: idle "breathing" and signal pulses are
   suppressed; highlighting still works.
   ============================================================ */

/* Runtime colours (mirror tokens --signal / --tan / --fg; applied as
   inline styles on SVG nodes during interaction). */
const C_SIGNAL = '#2D5BE3';
const C_TAN = '#C8B89A';
const C_FG = '#F0EDE6';

export function initNeuralNetwork() {
  /* ============================================================
     SKILL -> OUTPUT MAP  —  EDIT HERE to rewire skills to work.
     ------------------------------------------------------------
     Keys   = input/skill index, as a string  ("0"-"4" -> S1-S5)
     Values = array of output indices it feeds ("0"-"3" -> W1-W4)

       inputs (data-i)                outputs (data-o, data-target)
       "0" Data & Analytics            "0" Production Vision QA  -> #work
       "1" GenAI & LLM Builds          "1" JobPilot              -> #projects
       "2" Model Evaluation            "2" SlideNavigator AI     -> #projects
       "3" Business & Strategy         "3" Outlier / RWS         -> #work
       "4" AI Governance & Risk

     Between them sit four LABELLED hidden nodes — SCOPE, BUILD,
     MEASURE, GOVERN — so the diagram claims something rather than
     just decorating: every skill reaches every output through the
     same four steps. The hidden layer is not part of this map; it
     is fully connected by design.

     Two deliberate choices in the map:
       • AI Governance (S5) has no output of its own. It feeds three
         of the four, which is the point: governance is a property of
         the work, not a separate deliverable.
       • Outlier / RWS (W4) is the one output that is professional
         engagement rather than something self-built, so the right-hand
         column mixes employer work with self-directed work.

     ADD A SKILL:  add  <circle class="nn-input nn-idle-N" data-nn="in"
       data-i="5" ... tabindex="0" role="button" aria-label="...">  plus a
       <text data-inlabel data-i="5" ...>  in index.html, then add a
       "5": ["..."]  row below.
     ADD AN OUTPUT: add a <circle class="nn-output nn-idle-N"
       data-nn="out" data-o="4" data-target="#..." ...> + label in
       index.html, add a matching .nn-idle-N rule in animations.css,
       add one <line data-ho> per hidden node, and reference "4" from
       the skill rows below.
     ============================================================ */
  const SKILL_OUTPUT_MAP = {
    '0': ['0', '1'],           // Data & Analytics    -> Vision QA, JobPilot
    '1': ['1', '2'],           // GenAI & LLM Builds  -> JobPilot, SlideNavigator
    '2': ['0', '3'],           // Model Evaluation    -> Vision QA, Outlier/RWS
    '3': ['0', '3'],           // Business & Strategy -> Vision QA, Outlier/RWS
    '4': ['0', '1', '3']       // AI Governance       -> Vision QA, JobPilot, Outlier/RWS
  };
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile fallback buttons exist regardless of viewport — wire them up.
  initMobileFallback(SKILL_OUTPUT_MAP);

  const nn = document.querySelector('.nn-svg');
  if (!nn) return;

  const NS = 'http://www.w3.org/2000/svg';
  const qa = (sel) => Array.from(nn.querySelectorAll(sel));

  const inN = qa('[data-nn=in]');
  const hidN = qa('[data-nn=hid]');
  const outN = qa('[data-nn=out]');
  const ihL = qa('[data-ih]');
  const hoL = qa('[data-ho]');
  const outT = qa('[data-outlabel]');
  const center = (c) => ({ x: parseFloat(c.getAttribute('cx')), y: parseFloat(c.getAttribute('cy')) });

  let active = null;
  let timers = [];

  const idleOf = (el) => (reduce ? 'none' : (el.dataset.idle || 'none'));

  const clearPulses = () => {
    timers.forEach((id) => cancelAnimationFrame(id));
    timers = [];
    nn.querySelectorAll('[data-pulse]').forEach((p) => p.remove());
  };

  const restoreNeuron = (el) => {
    const t = el.dataset.nn;
    el.style.animation = idleOf(el);
    el.style.opacity = '1';
    el.style.filter = 'none';
    if (t === 'in') {
      el.setAttribute('r', '22'); el.style.stroke = C_SIGNAL; el.style.strokeWidth = '1.5';
    } else if (t === 'hid') {
      el.setAttribute('r', '16'); el.style.stroke = C_TAN; el.style.strokeOpacity = '0.4'; el.style.strokeWidth = '1.5';
    } else {
      el.setAttribute('r', '22'); el.style.stroke = C_FG; el.style.strokeWidth = '1.5';
    }
  };

  const reset = () => {
    active = null;
    clearPulses();
    ihL.concat(hoL).forEach((l) => { l.style.stroke = C_TAN; l.style.strokeOpacity = '0.08'; l.style.strokeWidth = '1'; });
    inN.concat(hidN, outN).forEach(restoreNeuron);
    outT.forEach((t) => { t.style.fillOpacity = '0.7'; t.style.fill = C_FG; });
  };

  const animatePulse = (pts, dur, delay, faint) => {
    const c = document.createElementNS(NS, 'circle');
    c.setAttribute('data-pulse', '1');
    c.setAttribute('r', faint ? '3' : '5');
    c.setAttribute('cx', pts[0].x);
    c.setAttribute('cy', pts[0].y);
    c.style.fill = faint ? C_TAN : C_SIGNAL;
    c.style.fillOpacity = faint ? '0.5' : '1';
    if (!faint) c.style.filter = 'drop-shadow(0 0 6px ' + C_SIGNAL + ')';
    nn.appendChild(c);

    const segs = [];
    let total = 0;
    for (let k = 0; k < pts.length - 1; k++) {
      const d = Math.hypot(pts[k + 1].x - pts[k].x, pts[k + 1].y - pts[k].y);
      segs.push(d); total += d;
    }

    let start = null;
    const run = (now) => {
      if (start === null) start = now;
      let t = (now - start - delay) / dur;
      if (t < 0) { timers.push(requestAnimationFrame(run)); return; }
      if (t > 1) t = 1;
      let dist = t * total, k = 0;
      while (k < segs.length && dist > segs[k]) { dist -= segs[k]; k++; }
      if (k >= segs.length) k = segs.length - 1;
      const f = segs[k] ? dist / segs[k] : 0;
      c.setAttribute('cx', pts[k].x + (pts[k + 1].x - pts[k].x) * f);
      c.setAttribute('cy', pts[k].y + (pts[k + 1].y - pts[k].y) * f);
      c.style.opacity = t < 0.12 ? String(t / 0.12) : (t > 0.88 ? String((1 - t) / 0.12) : '1');
      if (t < 1) timers.push(requestAnimationFrame(run));
      else c.remove();
    };
    timers.push(requestAnimationFrame(run));
  };

  const activate = (i) => {
    if (active === i) return;
    reset();
    active = i;
    const outs = SKILL_OUTPUT_MAP[i] || [];

    ihL.concat(hoL).forEach((l) => { l.style.strokeOpacity = '0.03'; });
    inN.concat(hidN, outN).forEach((el) => { el.style.animation = 'none'; el.style.opacity = '0.22'; });

    const inC = inN.find((c) => c.dataset.i === i);
    if (inC) {
      inC.style.opacity = '1';
      inC.setAttribute('r', '26');
      inC.style.strokeWidth = '2.5';
      inC.style.filter = 'drop-shadow(0 0 10px ' + C_SIGNAL + ')';
    }
    ihL.forEach((l) => { if (l.dataset.i === i) { l.style.stroke = C_SIGNAL; l.style.strokeOpacity = '0.6'; l.style.strokeWidth = '1.5'; } });
    hidN.forEach((c) => { c.style.opacity = '1'; c.style.stroke = C_SIGNAL; c.style.strokeOpacity = '0.7'; });
    hoL.forEach((l) => { if (outs.indexOf(l.dataset.o) >= 0) { l.style.stroke = C_SIGNAL; l.style.strokeOpacity = '0.6'; l.style.strokeWidth = '1.5'; } });
    outN.forEach((c) => {
      if (outs.indexOf(c.dataset.o) >= 0) {
        c.style.opacity = '1'; c.style.stroke = C_SIGNAL; c.setAttribute('r', '26');
        c.style.strokeWidth = '2.5'; c.style.filter = 'drop-shadow(0 0 10px ' + C_SIGNAL + ')';
      }
    });
    outT.forEach((t) => { if (outs.indexOf(t.dataset.o) >= 0) { t.style.fillOpacity = '1'; t.style.fill = C_SIGNAL; } });

    if (!reduce && inC) {
      const ip = center(inC);
      outs.forEach((o, idx) => {
        const hk = hidN[parseInt(o, 10) % hidN.length];
        const oc = outN.find((c) => c.dataset.o === o);
        if (hk && oc) animatePulse([ip, center(hk), center(oc)], 800, idx * 170, false);
      });
    }
  };

  const scrollToTarget = (tgt) => {
    if (!tgt) return;
    const dst = document.querySelector(tgt);
    if (dst) window.scrollTo({ top: dst.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  };

  const isEnterOrSpace = (e) => e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar';

  // Input neurons: hover / click / focus trace; Enter/Space activate.
  inN.forEach((c) => {
    c.addEventListener('mouseenter', () => activate(c.dataset.i));
    c.addEventListener('click', () => activate(c.dataset.i));
    c.addEventListener('focus', () => activate(c.dataset.i));
    c.addEventListener('blur', reset);
    c.addEventListener('keydown', (e) => { if (isEnterOrSpace(e)) { e.preventDefault(); activate(c.dataset.i); } });
  });

  // Output neurons: click / Enter / Space jump to the section.
  outN.forEach((c) => {
    c.addEventListener('click', () => scrollToTarget(c.dataset.target));
    c.addEventListener('keydown', (e) => { if (isEnterOrSpace(e)) { e.preventDefault(); scrollToTarget(c.dataset.target); } });
  });

  nn.addEventListener('mouseleave', reset);
  reset();

  // Ambient idle flow — random faint pulses when nothing is active.
  if (!reduce) {
    const allL = ihL.concat(hoL);
    setInterval(() => {
      if (active !== null || !allL.length || document.hidden) return;
      const l = allL[Math.floor(Math.random() * allL.length)];
      animatePulse(
        [{ x: +l.getAttribute('x1'), y: +l.getAttribute('y1') }, { x: +l.getAttribute('x2'), y: +l.getAttribute('y2') }],
        1200, 0, true
      );
    }, 2600);
  }
}

/* Mobile / touch fallback: tap a skill to highlight the work it
   builds; tap a work item to jump to its section. These are real
   <button>s, so they are keyboard-accessible by default. */
function initMobileFallback(map) {
  const mSkills = Array.from(document.querySelectorAll('[data-mskill]'));
  const mOuts = Array.from(document.querySelectorAll('[data-mout]'));
  if (!mSkills.length && !mOuts.length) return;

  let mActive = null;

  const mReset = () => {
    mActive = null;
    mSkills.forEach((b) => { b.style.background = 'rgba(45,91,227,0.1)'; b.style.boxShadow = 'none'; });
    mOuts.forEach((b) => { b.style.borderColor = 'rgba(240,237,230,0.12)'; b.style.boxShadow = 'none'; b.style.transform = 'none'; });
  };

  const mActivate = (i) => {
    if (mActive === i) { mReset(); return; }
    mReset();
    mActive = i;
    const outs = map[i] || [];
    mSkills.forEach((b) => {
      if (b.dataset.i === i) { b.style.background = 'var(--accent)'; b.style.boxShadow = '0 0 14px rgba(45,91,227,0.5)'; }
    });
    mOuts.forEach((b) => {
      if (outs.indexOf(b.dataset.o) >= 0) {
        b.style.borderColor = 'var(--accent)';
        b.style.boxShadow = '0 8px 30px rgba(45,91,227,0.18)';
        b.style.transform = 'translateX(6px)';
      }
    });
  };

  const scrollToTarget = (tgt) => {
    if (!tgt) return;
    const dst = document.querySelector(tgt);
    if (dst) window.scrollTo({ top: dst.getBoundingClientRect().top + window.scrollY - 70, behavior: 'smooth' });
  };

  mSkills.forEach((b) => b.addEventListener('click', () => mActivate(b.dataset.i)));
  mOuts.forEach((b) => b.addEventListener('click', () => scrollToTarget(b.dataset.target)));
}
