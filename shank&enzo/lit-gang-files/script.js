(function () {
  'use strict';

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Trigger entrance ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('ready'); }); });

  /* ---------- Hero title decrypt ---------- */
  const decrypt = document.querySelector('[data-decrypt]');
  if (decrypt && !reduceMotion) {
    const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#*<>_';
    const finalText = decrypt.textContent;
    let frame = 0;
    const totalFrames = 60;
    decrypt.textContent = '';
    const iv = setInterval(function () {
      frame++;
      const revealed = Math.floor((frame / totalFrames) * finalText.length);
      let out = '';
      for (let i = 0; i < finalText.length; i++) {
        const c = finalText[i];
        if (i < revealed || c === ' ') out += c;
        else out += glyphs[(Math.random() * glyphs.length) | 0];
      }
      decrypt.textContent = out;
      if (frame >= totalFrames) { decrypt.textContent = finalText; clearInterval(iv); }
    }, 30);
  }

  /* ---------- Stamp: CLASSIFIED -> DECLASSIFIED ---------- */
  const stamp = document.getElementById('stamp');
  if (stamp && !reduceMotion) {
    setTimeout(function () {
      stamp.textContent = 'DECLASSIFIED';
      stamp.classList.add('declassified');
    }, 2200);
  }

  /* ---------- Marquee builder ---------- */
  const marquees = {
    a: ['The Lit Gang Files', 'No Chill', 'Case Open', 'Certified Lit', 'Maximum Chaos', 'Still Recording'],
    b: ['Two Friends One Camera', 'A Ghostcode Case File', 'No Filter No Script', 'Entered Into Evidence', 'Witness The Chaos']
  };
  document.querySelectorAll('[data-marquee]').forEach(function (track) {
    const key = track.getAttribute('data-marquee');
    const phrases = marquees[key] || marquees.a;
    function buildGroup() {
      const group = document.createElement('div');
      group.className = 'strip-group';
      phrases.forEach(function (p) {
        const item = document.createElement('span');
        item.className = 'strip-item';
        item.textContent = p;
        const star = document.createElement('span');
        star.className = 'strip-star';
        star.textContent = '✦';
        group.appendChild(item);
        group.appendChild(star);
      });
      return group;
    }
    track.appendChild(buildGroup());
    track.appendChild(buildGroup());
  });

  /* ---------- Timeline scroll fill ---------- */
  const tlWrap = document.getElementById('tlWrap');
  const tlFill = document.getElementById('tlFill');
  function updateTimeline() {
    if (!tlWrap || !tlFill) return;
    const r = tlWrap.getBoundingClientRect();
    const vh = window.innerHeight;
    // 0 when the top hits mid-screen, 1 when the bottom passes mid-screen
    const p = clamp((vh * 0.5 - r.top) / r.height, 0, 1);
    tlFill.style.height = (p * 100).toFixed(2) + '%';
  }

  /* ---------- Scroll progress ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const scrollCue = document.getElementById('scrollCue');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      if (scrollProgress) {
        const total = document.documentElement.scrollHeight - window.innerHeight;
        const w = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
        scrollProgress.style.width = (w * 100).toFixed(2) + '%';
      }
      if (scrollCue) scrollCue.style.opacity = clamp(1 - window.scrollY / 300, 0, 1).toFixed(3);
      updateTimeline();
      ticking = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', updateTimeline);
  onScroll();

  /* ---------- Embers ---------- */
  const embers = document.getElementById('embers');
  if (embers && !reduceMotion) {
    for (let i = 0; i < 32; i++) {
      const e = document.createElement('span');
      e.className = 'ember';
      e.style.left = (Math.random() * 100).toFixed(2) + 'vw';
      e.style.setProperty('--drift', (Math.random() * 80 - 40).toFixed(0) + 'px');
      e.style.animationDuration = (6 + Math.random() * 8).toFixed(2) + 's';
      e.style.animationDelay = (-Math.random() * 14).toFixed(2) + 's';
      const s = (1 + Math.random() * 1.6).toFixed(2);
      e.style.width = s + 'px'; e.style.height = s + 'px';
      e.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
      embers.appendChild(e);
    }
  }

  /* ---------- Reveal on scroll + count-up ---------- */
  function countUp(el) {
    const target = parseFloat(el.getAttribute('data-count')) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    if (reduceMotion || target === 0) { el.textContent = format(target) + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(Math.round(target * eased)) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }
  function format(n) { return n >= 1000 ? n.toLocaleString('en-US') : String(n); }

  const revealables = document.querySelectorAll('[data-reveal], .card-reveal');
  const io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) {
        en.target.classList.add('in');
        en.target.querySelectorAll('[data-count]').forEach(countUp);
        io.unobserve(en.target);
      }
    });
  }, { threshold: 0.18 });
  revealables.forEach(function (el) { io.observe(el); });

  /* ---------- Card tilt / glow ---------- */
  if (canHover) {
    document.querySelectorAll('.dossier, .clip, .phrase').forEach(function (card) {
      const glow = card.querySelector('.card-glow');
      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.transform = 'perspective(1000px) rotateX(' + ((0.5 - py) * 8).toFixed(2) + 'deg) rotateY(' + ((px - 0.5) * 8).toFixed(2) + 'deg)';
        if (glow) { glow.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); glow.style.setProperty('--gy', (py * 100).toFixed(1) + '%'); }
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });
  }

  /* ---------- Ambience parallax ---------- */
  const ambience = document.querySelector('.bg-ambience');
  if (ambience && canHover && !reduceMotion) {
    let tx = 0, ty = 0, ax = 0, ay = 0;
    window.addEventListener('mousemove', function (e) {
      tx = (e.clientX / window.innerWidth - 0.5) * 40;
      ty = (e.clientY / window.innerHeight - 0.5) * 40;
    });
    (function drift() {
      ax += (tx - ax) * 0.05; ay += (ty - ay) * 0.05;
      ambience.style.transform = 'translate(' + ax.toFixed(2) + 'px, ' + ay.toFixed(2) + 'px)';
      requestAnimationFrame(drift);
    })();
  }

  /* ---------- Smoky multi-color cursor ---------- */
  if (canHover) {
    const cursor = document.getElementById('cursor');
    const smokeHues = [10, 22, 340, 300, 265, 190];
    let mx = innerWidth / 2, my = innerHeight / 2, cx = mx, cy = my, lastPuff = 0;
    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      const now = performance.now();
      if (!reduceMotion && now - lastPuff > 55) {
        lastPuff = now;
        const puff = document.createElement('span');
        puff.className = 'puff';
        puff.style.setProperty('--h', smokeHues[(Math.random() * smokeHues.length) | 0]);
        puff.style.setProperty('--r', ((Math.random() * 90 - 45) | 0) + 'deg');
        const sz = (10 + Math.random() * 12).toFixed(0);
        puff.style.width = sz + 'px'; puff.style.height = sz + 'px';
        puff.style.left = (mx + (Math.random() * 12 - 6)) + 'px';
        puff.style.top = (my + (Math.random() * 12 - 6)) + 'px';
        body.appendChild(puff);
        setTimeout(function () { puff.remove(); }, 1100);
      }
    });
    (function follow() {
      cx += (mx - cx) * 0.16; cy += (my - cy) * 0.16;
      cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
      requestAnimationFrame(follow);
    })();
    document.querySelectorAll('a, button, .dossier, .clip, .phrase').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor-hover'); });
    });
  }
})();
