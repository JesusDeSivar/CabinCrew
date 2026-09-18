/* Sonido, vibración, confeti y avisos flotantes. */
window.CC = window.CC || {};

CC.fx = (function () {
  let ctx = null;
  function audio() {
    if (!CC.store.get().settings.sound) return null;
    try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, when) {
    const a = audio(); if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    const t = a.currentTime + (when || 0);
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain || 0.18, t + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t); o.stop(t + dur + 0.02);
  }

  const sfx = {
    correct() { tone(660, 0.12, 'triangle', 0.16); tone(880, 0.18, 'triangle', 0.14, 0.09); },
    wrong()   { tone(196, 0.18, 'sawtooth', 0.10); tone(147, 0.24, 'sawtooth', 0.09, 0.1); },
    tap()     { tone(520, 0.05, 'sine', 0.07); },
    flip()    { tone(420, 0.07, 'sine', 0.08); tone(620, 0.07, 'sine', 0.06, 0.05); },
    win()     { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'triangle', 0.15, i * 0.11)); },
    unlock()  { [784, 988, 1319].forEach((f, i) => tone(f, 0.26, 'sine', 0.14, i * 0.13)); },
    heartLost() { tone(320, 0.2, 'square', 0.08); }
  };

  function buzz(pattern) {
    if (!CC.store.get().settings.haptics) return;
    if (navigator.vibrate) { try { navigator.vibrate(pattern); } catch (e) {} }
  }

  /* Confeti en canvas — ligero y respetuoso con prefers-reduced-motion */
  function confetti(opts) {
    opts = opts || {};
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cv = document.getElementById('fx-canvas');
    if (!cv) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = cv.clientWidth * dpr; cv.height = cv.clientHeight * dpr;
    const c = cv.getContext('2d'); c.scale(dpr, dpr);
    const W = cv.clientWidth, H = cv.clientHeight;
    const colors = ['#2FA8F5', '#17C26A', '#FFB020', '#FF6B81', '#7C5CFF', '#EAF6FF'];
    const n = opts.count || 90;
    const parts = Array.from({ length: n }, () => ({
      x: W / 2 + (Math.random() - 0.5) * W * 0.6,
      y: H * 0.32 + (Math.random() - 0.5) * 40,
      vx: (Math.random() - 0.5) * 7,
      vy: -Math.random() * 9 - 3,
      w: 5 + Math.random() * 6, h: 8 + Math.random() * 8,
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3,
      col: colors[(Math.random() * colors.length) | 0]
    }));
    let frames = 0;
    cv.hidden = false;
    (function step() {
      frames++;
      c.clearRect(0, 0, W, H);
      parts.forEach(p => {
        p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vx *= 0.99;
        c.save(); c.translate(p.x, p.y); c.rotate(p.rot);
        c.fillStyle = p.col; c.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); c.restore();
      });
      if (frames < 150) requestAnimationFrame(step);
      else { c.clearRect(0, 0, W, H); cv.hidden = true; }
    })();
  }

  let toastTimer = null;
  function toast(html, ms) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.innerHTML = html;
    t.hidden = false;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      t.classList.remove('show');
      setTimeout(() => { t.hidden = true; }, 300);
    }, ms || 2600);
  }

  return { sfx, buzz, confetti, toast };
})();
