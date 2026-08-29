(function () {
  'use strict';

  const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
  const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const body = document.body;

  /* ---------- Split the hero title into letters ---------- */
  const assemble = document.querySelector('[data-assemble]');
  if (assemble) {
    const text = assemble.textContent;
    assemble.textContent = '';
    text.split('').forEach(function (ch, i) {
      const s = document.createElement('span');
      s.className = 'ltr';
      s.textContent = ch;
      s.style.setProperty('--d', (0.1 + i * 0.08).toFixed(3) + 's');
      assemble.appendChild(s);
    });
  }

  /* ---------- Trigger entrance ---------- */
  requestAnimationFrame(function () { requestAnimationFrame(function () { body.classList.add('ready'); }); });

  /* ---------- Eyebrow scramble ---------- */
  const eyebrow = document.getElementById('heroEyebrow');
  if (eyebrow && !reduceMotion) {
    const glyphs = '/\\#*<>_[]=+';
    const finalText = eyebrow.textContent;
    let frame = 0;
    const totalFrames = 44;
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
    }, 300);
  }

  /* ---------- Marquee builder ---------- */
  const marquees = {
    a: ['Akara & Co.', 'Certified Golden', 'One Comment', 'No Chill', 'Extra Pepper', 'Built Not Fried... Also Fried'],
    b: ['Est. From The Replies', 'A Ghostcode Movement', 'Beans With A Point To Prove', 'Sold Out Always', 'Take It Seriously'],
    ticker: ['Now Serving', 'Batch No. 001', 'Oil Temp: Viral', 'Pepper Level: Personal', 'Believers Only']
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

  /* ---------- Scroll progress ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const scrollCue = document.getElementById('scrollCue');
  function onScroll() {
    if (scrollProgress) {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const w = total > 0 ? clamp(window.scrollY / total, 0, 1) : 0;
      scrollProgress.style.width = (w * 100).toFixed(2) + '%';
    }
    if (scrollCue) scrollCue.style.opacity = clamp(1 - window.scrollY / 300, 0, 1).toFixed(3);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
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
    const prefix = el.getAttribute('data-prefix') || '';
    if (reduceMotion || target === 0) { el.textContent = prefix + format(target) + suffix; return; }
    const dur = 1600;
    const start = performance.now();
    (function tick(now) {
      const t = clamp((now - start) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = prefix + format(Math.round(target * eased)) + suffix;
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

  /* ---------- Card tilt / glow / parallax depth ---------- */
  if (canHover) {
    document.querySelectorAll('.prod, .press-card').forEach(function (card) {
      const glow = card.querySelector('.card-glow');
      const tilt = card.querySelector('.prod-3d') || card;
      const inner = tilt !== card;
      card.addEventListener('mousemove', function (e) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        const rx = ((0.5 - py) * (inner ? 15 : 10)).toFixed(2);
        const ry = ((px - 0.5) * (inner ? 17 : 10)).toFixed(2);
        tilt.style.transform = (inner ? '' : 'perspective(1000px) ') + 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
        if (glow) { glow.style.setProperty('--gx', (px * 100).toFixed(1) + '%'); glow.style.setProperty('--gy', (py * 100).toFixed(1) + '%'); }
      });
      card.addEventListener('mouseleave', function () { tilt.style.transform = ''; });
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

  /* ---------- Build the 3D coin rim + depth particles ---------- */
  (function () {
    const edge = document.getElementById('coinEdge');
    if (edge) {
      const R = 180, N = 60, w = Math.ceil((2 * Math.PI * R) / N) + 2;
      for (let i = 0; i < N; i++) {
        const seg = document.createElement('span');
        seg.className = 'coin-seg';
        seg.style.width = w + 'px';
        seg.style.setProperty('--lit', (Math.sin((i / N) * Math.PI * 2) * 0.5 + 0.5).toFixed(3));
        seg.style.transform = 'translate(-50%,-50%) rotateY(' + (i * 360 / N).toFixed(2) + 'deg) translateZ(' + R + 'px)';
        edge.appendChild(seg);
      }
    }
    const field = document.getElementById('depthField');
    if (field && !reduceMotion) {
      for (let i = 0; i < 26; i++) {
        const m = document.createElement('span');
        m.className = 'mote';
        const s = (2 + Math.random() * 4).toFixed(1);
        m.style.width = s + 'px'; m.style.height = s + 'px';
        const x = (Math.random() * 760 - 380).toFixed(0);
        const y = (Math.random() * 620 - 310).toFixed(0);
        const z = (Math.random() * 640 - 400).toFixed(0);
        m.style.transform = 'translate(-50%,-50%) translate3d(' + x + 'px,' + y + 'px,' + z + 'px)';
        m.style.setProperty('--tw', (2 + Math.random() * 4).toFixed(2) + 's');
        m.style.animationDelay = (-Math.random() * 4).toFixed(2) + 's';
        const blur = Math.min(3, Math.abs(parseFloat(z)) / 150);
        if (blur > 0.35) m.style.filter = 'blur(' + blur.toFixed(1) + 'px)';
        field.appendChild(m);
      }
    }
  })();

  /* ---------- 3D camera rig (mouse orbit + scroll dolly, pure CSS 3D) ---------- */
  (function () {
    const stage = document.getElementById('stage');
    const scene = document.getElementById('scene');
    const sceneTitle = document.getElementById('sceneTitle');
    if (!stage) return;
    const baseScale = function () {
      const w = window.innerWidth;
      return w < 640 ? 0.55 : w < 900 ? 0.74 : 1;
    };
    if (!canHover || reduceMotion) {
      stage.style.transform = 'scale(' + baseScale() + ') rotateX(6deg) rotateY(-14deg)';
      return;
    }
    let tx = 0, ty = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      tx = e.clientX / window.innerWidth - 0.5;
      ty = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    (function cam() {
      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      const sp = clamp(window.scrollY / window.innerHeight, 0, 1);
      const rotY = cx * 18;
      const rotX = -cy * 12 + sp * 24;
      const dolly = sp * 540;
      stage.style.transform = 'scale(' + baseScale() + ') translateZ(' + dolly.toFixed(1) + 'px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg)';
      if (scene) scene.style.opacity = clamp(1 - sp * 1.05, 0, 1).toFixed(3);
      if (sceneTitle) {
        sceneTitle.style.transform = 'translate3d(' + (cx * -26).toFixed(1) + 'px,' + (cy * -18 - sp * 70).toFixed(1) + 'px,0)';
        sceneTitle.style.opacity = clamp(1 - sp * 1.15, 0, 1).toFixed(3);
      }
      requestAnimationFrame(cam);
    })();
  })();

  /* ---------- Faux drop countdown (resets endlessly — it "releases when it releases") ---------- */
  const dcH = document.getElementById('dcH');
  const dcM = document.getElementById('dcM');
  const dcS = document.getElementById('dcS');
  if (dcH && dcM && dcS) {
    const pad = function (n) { return String(n).padStart(2, '0'); };
    setInterval(function () {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0); // midnight — the "midnight drop"
      let diff = Math.max(0, Math.floor((end - now) / 1000));
      const h = Math.floor(diff / 3600); diff %= 3600;
      const m = Math.floor(diff / 60);
      const s = diff % 60;
      dcH.textContent = pad(h); dcM.textContent = pad(m); dcS.textContent = pad(s);
    }, 1000);
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
    document.querySelectorAll('a, button, .prod, .press-card').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cursor.classList.add('cursor-hover'); });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('cursor-hover'); });
    });
  }
})();
