(function () {
  'use strict';

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Intro title card ---------- */
  const intro = document.getElementById('intro');
  const introPct = document.getElementById('introPct');
  const body = document.body;

  function runIntro() {
    if (reduceMotion || !intro) {
      body.classList.add('ready');
      if (intro) intro.classList.add('hidden');
      return;
    }
    const dur = 1450;
    const start = performance.now();
    (function count(now) {
      const t = clamp((now - start) / dur, 0, 1);
      if (introPct) introPct.textContent = Math.round(t * 100);
      if (t < 1) requestAnimationFrame(count);
    })(start);

    setTimeout(function () { body.classList.add('ready'); }, 1500);
    setTimeout(function () { intro.classList.add('hidden'); }, 2750);
  }
  runIntro();

  /* ---------- Split the first headline line into letters ---------- */
  const splitTarget = document.querySelector('[data-split]');
  if (splitTarget) {
    const text = splitTarget.textContent;
    splitTarget.textContent = '';
    text.split('').forEach(function (ch, i) {
      const s = document.createElement('span');
      s.className = 'ltr';
      s.textContent = ch;
      s.style.setProperty('--d', (0.15 + i * 0.065).toFixed(3) + 's');
      splitTarget.appendChild(s);
    });
  }

  /* ---------- Eyebrow scramble on entrance ---------- */
  const eyebrow = document.getElementById('eyebrow');
  if (eyebrow && !reduceMotion) {
    const glyphs = '/\\#*<>_[]=+';
    const finalText = eyebrow.textContent;
    let frame = 0;
    const totalFrames = 42;
    setTimeout(function () {
      const iv = setInterval(function () {
        frame++;
        const revealed = Math.floor((frame / totalFrames) * finalText.length);
        let out = '';
        for (let i = 0; i < finalText.length; i++) {
          const c = finalText[i];
          if (i < revealed || c === ' ') out += c;
          else out += glyphs[(Math.random() * glyphs.length) | 0];
        }
        eyebrow.textContent = out;
        if (frame >= totalFrames) { eyebrow.textContent = finalText; clearInterval(iv); }
      }, 32);
    }, 1600);
  }

  /* ---------- Kinetic marquee builder ---------- */
  const marquees = {
    a: ['Shank & Enzo', 'Lit Gang', 'No Chill', 'Built Not Generated', 'Akara Season', 'Certified Lit'],
    b: ['Live Every Week', 'Ghostcode', 'No Filter', 'No Script', 'Group-Chat Energy', 'Sold-Out Rooms']
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
    // Two identical groups so the -50% loop is seamless
    track.appendChild(buildGroup());
    track.appendChild(buildGroup());
  });

  /* ---------- Scroll-driven hero (mechanic unchanged) ---------- */
  const heroWrap = document.querySelector('.hero-wrap');
  const photoLayer = document.getElementById('photoLayer');
  const heroOverlay = document.getElementById('heroOverlay');
  const bridge = document.getElementById('bridge');
  const scrollCue = document.getElementById('scrollCue');
  const act2 = document.getElementById('act2');
  const scrollProgress = document.getElementById('scrollProgress');

  function heroProgress() {
    const total = heroWrap.offsetHeight - window.innerHeight;
    if (total <= 0) return 0;
    return clamp(-heroWrap.getBoundingClientRect().top / total, 0, 1);
  }

  function applyHero(p) {
    const zoom = clamp(p / 0.5, 0, 1);
    const scale = 1 + zoom * 1.1; // caps at 2.1 — soft enough to stay legible
    photoLayer.style.transform = 'scale(' + scale.toFixed(4) + ')';
    photoLayer.style.opacity = (1 - zoom * 0.55).toFixed(3);

    heroOverlay.style.opacity = clamp(1 - p * 2.4, 0, 1).toFixed(3);
    heroOverlay.style.transform = 'scale(' + (1 + p * 0.6).toFixed(4) + ')';
    heroOverlay.style.filter = 'blur(' + (p * 3).toFixed(2) + 'px)';

    let b = 0;
    if (p > 0.35 && p < 0.65) b = Math.sin(((p - 0.35) / 0.3) * Math.PI);
    bridge.style.opacity = b.toFixed(3);

    scrollCue.style.opacity = clamp(1 - p * 10, 0, 1).toFixed(3);

    // Second act fills the back half of the pin (after the zoom peaks)
    if (act2) {
      const a2 = clamp((p - 0.6) / 0.28, 0, 1);
      act2.style.setProperty('--a2', a2.toFixed(3));
    }
  }

  function updateProgressBar() {
    if (!scrollProgress) return;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    const w = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
    scrollProgress.style.width = (w * 100).toFixed(2) + '%';
  }

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      applyHero(heroProgress());
      updateProgressBar();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () { applyHero(heroProgress()); updateProgressBar(); });
  applyHero(heroProgress());
  updateProgressBar();

  /* ---------- Rising embers ---------- */
  const embers = document.getElementById('embers');
  if (embers && !reduceMotion) {
    for (let i = 0; i < 34; i++) {
      const e = document.createElement('span');
      e.className = 'ember';
      e.style.left = (Math.random() * 100).toFixed(2) + 'vw';
      e.style.setProperty('--drift', (Math.random() * 80 - 40).toFixed(0) + 'px');
      e.style.animationDuration = (6 + Math.random() * 8).toFixed(2) + 's';
      e.style.animationDelay = (-Math.random() * 14).toFixed(2) + 's';
      const s = (1 + Math.random() * 1.6).toFixed(2);
      e.style.width = s + 'px';
      e.style.height = s + 'px';
      e.style.opacity = (0.3 + Math.random() * 0.5).toFixed(2);
      embers.appendChild(e);
    }
  }

  /* ---------- Generic reveal-on-scroll ---------- */
  const revealables = document.querySelectorAll('.reveal, .card-reveal');
  if (revealables.length) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.18 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Card tilt, cursor-tracked glow, magnetic link ---------- */
  if (canHover) {
    document.querySelectorAll('.card').forEach(function (card) {
      const glow = card.querySelector('.card-glow');
      const link = card.querySelector('.card-link');

      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;

        card.style.transform =
          'perspective(1000px) rotateX(' + ((0.5 - py) * 12).toFixed(2) +
          'deg) rotateY(' + ((px - 0.5) * 12).toFixed(2) + 'deg)';

        if (glow) {
          glow.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
          glow.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
        }

        if (link) {
          const lr = link.getBoundingClientRect();
          const dx = e.clientX - (lr.left + lr.width / 2);
          const dy = e.clientY - (lr.top + lr.height / 2);
          if (Math.hypot(dx, dy) < 140) {
            link.style.transform = 'translate(' + (dx * 0.3).toFixed(1) + 'px, ' + (dy * 0.3).toFixed(1) + 'px)';
          } else {
            link.style.transform = 'none';
          }
        }
      });

      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
        if (link) link.style.transform = 'none';
      });
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
      ax += (tx - ax) * 0.05;
      ay += (ty - ay) * 0.05;
      ambience.style.transform = 'translate(' + ax.toFixed(2) + 'px, ' + ay.toFixed(2) + 'px)';
      requestAnimationFrame(drift);
    })();
  }

  /* ---------- Smoky multi-color cursor ---------- */
  if (canHover) {
    const cursor = document.getElementById('cursor');
    const smokeHues = [10, 22, 340, 300, 265, 190]; // ember, amber, pink, magenta, violet, cyan
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let cx = mx;
    let cy = my;
    let lastPuff = 0;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX;
      my = e.clientY;
      const now = performance.now();
      if (!reduceMotion && now - lastPuff > 55) {
        lastPuff = now;
        const puff = document.createElement('span');
        puff.className = 'puff';
        const h = smokeHues[(Math.random() * smokeHues.length) | 0];
        puff.style.setProperty('--h', h);
        puff.style.setProperty('--r', ((Math.random() * 90 - 45) | 0) + 'deg');
        const sz = (10 + Math.random() * 12).toFixed(0);
        puff.style.width = sz + 'px';
        puff.style.height = sz + 'px';
        puff.style.left = (mx + (Math.random() * 12 - 6)) + 'px';
        puff.style.top = (my + (Math.random() * 12 - 6)) + 'px';
        document.body.appendChild(puff);
        setTimeout(function () { puff.remove(); }, 1100);
      }
    });

    (function follow() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.transform = 'translate(' + cx + 'px, ' + cy + 'px)';
      requestAnimationFrame(follow);
    })();

    document.querySelectorAll('a, button, .card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor-hover'); });
    });
  }
})();
