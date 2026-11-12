/* OS-MPM project page */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var SVG = 'http://www.w3.org/2000/svg';
  function el(name, attrs, parent) {
    var e = document.createElementNS(SVG, name);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------- mathematics ---------- */
  function renderMath(root) {
    if (!window.renderMathInElement) return;
    window.renderMathInElement(root || document.body, {
      delimiters: [
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false }
      ],
      throwOnError: false
    });
  }

  /* ---------- navigation ---------- */
  function initNav() {
    var nav = $('.nav');
    var links = $$('.nav nav a[href^="#"]');
    var sections = links.map(function (a) { return $(a.getAttribute('href')); });
    function onScroll() {
      nav.classList.toggle('scrolled', window.scrollY > 8);
      var y = window.scrollY + 120, current = -1;
      sections.forEach(function (s, i) { if (s && s.offsetTop <= y) current = i; });
      links.forEach(function (a, i) { a.classList.toggle('active', i === current); });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- reveal on scroll ---------- */
  function initReveal() {
    var items = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (e) { io.observe(e); });
  }

  /* ---------- videos: play only when visible; keep the two hero views in step ---------- */
  function initVideos() {
    var videos = $$('video');
    if (reduceMotion) {
      videos.forEach(function (v) { v.removeAttribute('autoplay'); v.pause(); v.setAttribute('controls', ''); });
      return;
    }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.15 });
      videos.forEach(function (v) { io.observe(v); });
    }
    var duo = $$('#hero-media video');
    if (duo.length === 2) {
      var lead = duo[0], follow = duo[1];
      var sync = function () {
        if (follow.readyState < 2 || lead.readyState < 2) return;
        if (Math.abs(follow.currentTime - lead.currentTime) > 0.12) follow.currentTime = lead.currentTime;
      };
      lead.addEventListener('timeupdate', sync);
      lead.addEventListener('seeked', sync);
    }
  }

  /* ---------- method stepper ---------- */
  function initStepper() {
    var scene = $('#scene');
    if (!scene) return;
    var X0 = 20, XB = 420, XS = 300, X1 = 740, Y0 = 52, Y1 = 252;

    // grids
    var gb = $('#grid-b'), gs = $('#grid-s'), x, y, i;
    for (x = X0; x <= 460; x += 40) el('line', { x1: x, y1: Y0, x2: x, y2: Y1 }, gb);
    for (y = Y0; y <= Y1; y += 40) el('line', { x1: X0, y1: y, x2: 460, y2: y }, gb);
    for (x = 280; x <= X1; x += 20) el('line', { x1: x, y1: Y0, x2: x, y2: Y1 }, gs);
    for (y = Y0; y <= Y1; y += 20) el('line', { x1: 280, y1: y, x2: X1, y2: y }, gs);

    // particles (deterministic jitter)
    var seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; }
    var pb = $('#pb'), ps = $('#ps');
    for (x = X0 + 10; x < XB; x += 20) for (y = Y0 + 10; y < Y1; y += 20)
      el('circle', { cx: (x + rnd() * 5).toFixed(1), cy: (y + rnd() * 5).toFixed(1), r: 2.7 }, pb);
    for (x = XS + 5; x < X1; x += 10) for (y = Y0 + 5; y < Y1; y += 10)
      el('circle', { cx: (x + rnd() * 2.6).toFixed(1), cy: (y + rnd() * 2.6).toFixed(1), r: 1.75 }, ps);

    // receiver nodes and transfer arrows
    var gamB = $('#gam-b'), gamS = $('#gam-s'), fsb = $('#flow-sb'), fbs = $('#flow-bs');
    for (i = 0; i <= 5; i++) {
      y = Y0 + 40 * i;
      el('circle', { cx: XB, cy: y, r: 4 }, gamB);
      el('path', { d: 'M' + (XB + 52) + ' ' + y + 'H' + (XB + 9), 'marker-end': 'url(#ah-s)', 'class': 'go' }, fsb);
      el('path', { d: 'M' + (XS - 52) + ' ' + y + 'H' + (XS - 9), 'marker-end': 'url(#ah-b)', 'class': 'go' }, fbs);
    }
    for (i = 0; i <= 10; i++) el('circle', { cx: XS, cy: Y0 + 20 * i, r: 3 }, gamS);

    // timeline
    var segX = [72, 204, 332], segW = 124;
    var tracks = $('#tl-s-tracks'), fills = $('#tl-s');
    var tlS = segX.map(function (sx) {
      el('rect', { 'class': 'tl-track', x: sx, y: 388, width: segW, height: 12, rx: 3 }, tracks);
      return el('rect', { 'class': 'tl-s tl-fill', x: sx, y: 388, width: segW, height: 12, rx: 3 }, fills);
    });
    var tlB = $('#tl-b');
    tlB.setAttribute('width', 384);
    tlB.classList.add('tl-fill');
    var res = [$('#res-1'), $('#res-2')];
    res[0].setAttribute('y', 340); res[0].setAttribute('height', 80);
    res[1].setAttribute('y', 402); res[1].setAttribute('height', 18);
    var verdict = $('#verdict');
    verdict.setAttribute('x', 740); verdict.setAttribute('y', 326); verdict.setAttribute('text-anchor', 'end');

    var PH = [
      { phase: 'prep', step: 0, k: 1, dur: 3000 },
      { phase: 'coarse', step: 1, k: 1, dur: 2800 },
      { phase: 'fine', step: 2, k: 1, dur: 3600 },
      { phase: 'check', step: 3, k: 1, dur: 2600 },
      { phase: 'coarse', step: 1, k: 2, dur: 2800 },
      { phase: 'fine', step: 2, k: 2, dur: 3600 },
      { phase: 'check', step: 3, k: 2, dur: 2600 },
      { phase: 'advance', step: 4, k: 2, dur: 3400 }
    ];
    var items = $$('#steps li'), status = $('#st-status');
    var playBtn = $('#st-play'), playIcon = $('#st-play-icon');
    var idx = 0, playing = false, timer = null, token = 0;

    function scale(node, v, ms, axis) {
      node.style.transition = ms ? 'transform ' + ms + 'ms linear, opacity .3s' : 'opacity .3s';
      node.style.transform = (axis === 'y' ? 'scaleY(' : 'scaleX(') + v + ')';
    }
    function shift(node, v, ms) {
      node.style.transition = ms ? 'transform ' + ms + 'ms ease-in-out, opacity .45s ease' : 'opacity .45s ease';
      node.style.transform = 'translate(' + (7 * v) + 'px,0)';
    }
    function later(fn, ms, t) { setTimeout(function () { if (t === token) fn(); }, ms); }

    function show(n, animate) {
      idx = (n + PH.length) % PH.length;
      var p = PH[idx], t = ++token, d = animate && !reduceMotion ? p.dur : 0;
      scene.setAttribute('data-phase', p.phase);
      items.forEach(function (li) {
        var s = +li.getAttribute('data-step');
        li.classList.toggle('on', s === p.step);
        li.classList.toggle('done', s < p.step);
      });
      status.innerHTML = p.phase === 'prep' ? 'Before the first sweep'
        : p.phase === 'advance' ? 'Converged after <b>2 sweeps</b>'
        : 'Schwarz sweep <b>k = ' + p.k + '</b>';

      // state reached before this phase starts
      var coarseDone = p.phase === 'fine' || p.phase === 'check' || p.phase === 'advance';
      var fineDone = p.phase === 'check' || p.phase === 'advance' || (p.phase === 'coarse' && p.k === 2);
      scale(tlB, coarseDone ? 1 : 0, 0);
      tlS.forEach(function (r) { scale(r, fineDone ? 1 : 0, 0); r.style.opacity = (p.phase === 'coarse' && p.k === 2) ? 0.35 : 1; });
      shift(ps, fineDone ? 1 : 0, 0);
      shift(pb, 0, 0);
      scale(res[0], (p.k === 2 || p.phase === 'advance') ? 1 : 0, 0, 'y');
      scale(res[1], p.phase === 'advance' ? 1 : 0, 0, 'y');
      verdict.classList.remove('show');

      // what happens during this phase
      if (p.phase === 'coarse') {
        later(function () { scale(tlB, 1, d * 0.8); }, 60, t);
      } else if (p.phase === 'fine') {
        var each = d * 0.26;
        tlS.forEach(function (r, m) {
          later(function () { scale(r, 1, each); shift(ps, (m + 1) / 3, each); }, 120 + m * (each + d * 0.03), t);
        });
      } else if (p.phase === 'check') {
        var bar = res[p.k - 1];
        later(function () {
          bar.style.transition = d ? 'transform ' + Math.min(700, d) + 'ms cubic-bezier(.2,.7,.2,1)' : '';
          bar.style.transform = 'scaleY(1)';
        }, 80, t);
        later(function () {
          verdict.textContent = p.k === 1 ? 'r > ε   sweep again' : 'r ≤ ε   converged';
          verdict.style.fill = p.k === 1 ? '#1f5a86' : '#2f7a4f';
          verdict.classList.add('show');
        }, d ? 800 : 0, t);
      } else if (p.phase === 'advance') {
        verdict.textContent = 'r ≤ ε   converged';
        verdict.style.fill = '#2f7a4f';
        verdict.classList.add('show');
        later(function () { shift(pb, 1, d * 0.6); }, 200, t);
      }
    }

    function schedule() {
      clearTimeout(timer);
      if (!playing) return;
      timer = setTimeout(function () { show(idx + 1, true); schedule(); }, PH[idx].dur + (idx === PH.length - 1 ? 1200 : 0));
    }
    function setPlaying(v) {
      playing = v;
      playIcon.setAttribute('d', v ? 'M4 2.800h3v10.400H4zM9 2.800h3v10.400H9z' : 'M4.500 2.800v10.400L13 8z');
      playBtn.setAttribute('aria-label', v ? 'Pause' : 'Play');
      if (v) { show(idx, true); schedule(); } else clearTimeout(timer);
    }

    playBtn.addEventListener('click', function () { userTouched = true; setPlaying(!playing); });
    $('#st-prev').addEventListener('click', function () { userTouched = true; setPlaying(false); show(idx - 1, true); });
    $('#st-next').addEventListener('click', function () { userTouched = true; setPlaying(false); show(idx + 1, true); });
    items.forEach(function (li) {
      $('button', li).addEventListener('click', function () {
        userTouched = true;
        var s = +li.getAttribute('data-step'), sweepStart = PH[idx].k === 2 ? 4 : 0, n = -1;
        for (var j = sweepStart; j < PH.length && n < 0; j++) if (PH[j].step === s) n = j;
        if (n < 0) for (j = 0; j < PH.length && n < 0; j++) if (PH[j].step === s) n = j;
        setPlaying(false);
        show(n, true);
      });
    });

    var userTouched = false;
    show(0, false);
    if (!reduceMotion && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !playing && !userTouched) setPlaying(true);
          if (!en.isIntersecting && playing) { setPlaying(false); }
        });
      }, { threshold: 0.4 }).observe($('#stepper'));
    }
  }

  /* ---------- inclusion: stiffness-ratio tabs ---------- */
  function initTabs() {
    var fig = $('#inc-fig');
    if (!fig) return;
    var imgs = $$('img[data-k]', fig), ref = $('#inc-ref');
    var figNo = { 1: 12, 2: 13, 5: 14 };
    var tabs = $$('[role="tab"]', fig);
    var src = function (r, k) { return 'assets/fig/inclusion_r' + r + '_' + k + '.webp'; };
    var preloaded = false;
    var preload = function () {
      if (preloaded) return;
      preloaded = true;
      [2, 5].forEach(function (r) { imgs.forEach(function (im) { new Image().src = src(r, im.getAttribute('data-k')); }); });
    };
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { preload(); io.disconnect(); } }, { rootMargin: '600px' });
      io.observe(fig);
    } else preload();
    tabs.forEach(function (b, n) {
      b.addEventListener('click', function () {
        var r = b.getAttribute('data-r');
        tabs.forEach(function (o) { o.setAttribute('aria-selected', o === b ? 'true' : 'false'); });
        imgs.forEach(function (im) { im.src = src(r, im.getAttribute('data-k')); });
        ref.textContent = 'Fig. ' + figNo[r] + ', rearranged';
      });
      b.addEventListener('keydown', function (e) {
        var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return;
        var o = tabs[(n + d + tabs.length) % tabs.length];
        o.focus(); o.click();
      });
    });
  }

  /* ---------- inclusion: CPU time and speed-up ---------- */
  // Fig. 16 of the paper, finest level: total CPU seconds and center-strip relative L1 stress error (%).
  var COST = [
    { r: 1, h: '0.004', u: 4992.9, o: 756.4, eu: 4.5, eo: 4.7 },
    { r: 2, h: '0.004', u: 5114.4, o: 559.3, eu: 6.1, eo: 6.2 },
    { r: 5, h: '0.004', u: 5841.7, o: 1347.3, eu: 10.3, eo: 10.2 }
  ];
  function initSpeed() {
    var rows = $('#speed-rows');
    if (!rows) return;
    var fmt = function (v) { return Math.round(v).toLocaleString('en-US'); };
    var finest = COST.filter(function (c) { return c.h === '0.004'; });
    var max = Math.max.apply(null, finest.map(function (c) { return c.u; }));
    var tip = $('#tip');
    finest.forEach(function (c) {
      var row = document.createElement('div');
      row.className = 'row';
      row.innerHTML =
        '<div class="name"><b>E<sub>in</sub>/E<sub>out</sub> = ' + c.r + '</b></div>' +
        '<div class="bars">' +
        '<div class="bar u" tabindex="0" data-tip="<b>Uniform fine-grid MPM</b><br>' + fmt(c.u) + ' s CPU · stress error ' + c.eu.toFixed(1) + '%"><i data-w="' + (100 * c.u / max * 0.86).toFixed(2) + '"></i><span>' + fmt(c.u) + ' s</span></div>' +
        '<div class="bar o" tabindex="0" data-tip="<b>OS-MPM</b><br>' + fmt(c.o) + ' s CPU · stress error ' + c.eo.toFixed(1) + '%"><i data-w="' + (100 * c.o / max * 0.86).toFixed(2) + '"></i><span>' + fmt(c.o) + ' s</span></div>' +
        '</div>' +
        '<div class="x">' + (c.u / c.o).toFixed(1) + '×<small>faster</small></div>';
      rows.appendChild(row);
    });
    function grow() { $$('.bar i', rows).forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; }); }
    if (reduceMotion || !('IntersectionObserver' in window)) grow();
    else new IntersectionObserver(function (en, io) { if (en[0].isIntersecting) { grow(); io.disconnect(); } }, { threshold: 0.35 }).observe(rows);

    function place(x, y) {
      var w = tip.offsetWidth, h = tip.offsetHeight;
      tip.style.left = Math.max(8, Math.min(window.innerWidth - w - 8, x - w / 2)) + 'px';
      tip.style.top = Math.max(8, y - h - 14) + 'px';
    }
    $$('.bar', rows).forEach(function (b) {
      b.addEventListener('pointermove', function (e) { tip.innerHTML = b.getAttribute('data-tip'); tip.classList.add('show'); place(e.clientX, e.clientY); });
      b.addEventListener('pointerleave', function () { tip.classList.remove('show'); });
      b.addEventListener('focus', function () { var r = b.getBoundingClientRect(); tip.innerHTML = b.getAttribute('data-tip'); tip.classList.add('show'); place(r.left + r.width / 3, r.top); });
      b.addEventListener('blur', function () { tip.classList.remove('show'); });
    });
  }

  /* ---------- BibTeX ---------- */
  function initCopy() {
    var btn = $('#copy-bib');
    if (!btn) return;
    btn.addEventListener('click', function () {
      var text = $('#bibtex').textContent;
      var done = function () { btn.textContent = 'Copied'; setTimeout(function () { btn.textContent = 'Copy BibTeX'; }, 1800); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback() {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- figure lightbox ---------- */
  function initLightbox() {
    var box = $('#lightbox'), big = $('img', box), last = null;
    function close() { box.classList.remove('open'); big.removeAttribute('src'); if (last) last.focus(); }
    $$('.zoomable').forEach(function (img) {
      img.setAttribute('tabindex', '0');
      img.setAttribute('role', 'button');
      img.setAttribute('aria-label', 'Enlarge figure: ' + (img.getAttribute('alt') || ''));
      function open() { last = img; big.src = img.currentSrc || img.src; big.alt = img.alt; box.classList.add('open'); box.focus(); }
      img.addEventListener('click', open);
      img.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
    box.addEventListener('click', close);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && box.classList.contains('open')) close(); });
  }

  function init() {
    renderMath();
    initNav();
    initReveal();
    initVideos();
    initStepper();
    initTabs();
    initSpeed();
    initCopy();
    initLightbox();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
