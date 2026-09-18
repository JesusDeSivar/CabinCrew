/* Sesión de lección (con corazones) y simulacro de examen. */
window.CC = window.CC || {};

(function () {
  const esc = s => CC.util.esc(s);

  function sessionShell(opts) {
    return `
      <div class="q-top">
        <button class="q-close" type="button" aria-label="Salir">✕</button>
        <div class="q-bar"><i style="width:0%"></i></div>
        ${opts.hearts ? '<span class="q-hearts">❤️ <b>' + CC.store.hearts() + '</b></span>'
                      : '<span class="q-hearts q-timer">⏱ <b>00:00</b></span>'}
      </div>
      <div class="q-body"></div>
      <div class="q-foot">
        <button class="btn primary big" type="button" disabled data-check>COMPROBAR</button>
      </div>
      <div class="sheet" hidden></div>`;
  }

  /* ── Motor común ─────────────────────────────────────── */
  function runSession(root, cfg) {
    root.innerHTML = sessionShell(cfg);
    const body = root.querySelector('.q-body');
    const bar = root.querySelector('.q-bar i');
    const btn = root.querySelector('[data-check]');
    const sheet = root.querySelector('.sheet');
    const heartsEl = root.querySelector('.q-hearts b');

    let queue = cfg.exercises.slice();
    const total = queue.length;
    let done = 0, correct = 0, wrongCards = [], combo = 0, bestCombo = 0, xp = 0;
    let ex = null, answered = false;
    const startedAt = Date.now();

    if (cfg.timer) {
      const t = setInterval(() => {
        if (!document.body.contains(root)) return clearInterval(t);
        const s = Math.floor((Date.now() - startedAt) / 1000);
        heartsEl.textContent = CC.util.pad(Math.floor(s / 60)) + ':' + CC.util.pad(s % 60);
      }, 1000);
    }

    root.querySelector('.q-close').addEventListener('click', () => {
      if (done && !confirm('¿Salir de la sesión? Perderás el progreso de esta ronda.')) return;
      CC.app.go(cfg.backTo || 'home');
    });

    function progress() { bar.style.width = Math.round((done / total) * 100) + '%'; }

    function next() {
      answered = false;
      sheet.hidden = true; sheet.className = 'sheet';
      btn.disabled = true; btn.textContent = 'COMPROBAR'; btn.className = 'btn primary big';
      if (!queue.length) return finish();
      ex = queue.shift();
      body.innerHTML = CC.exercise.render(ex);
      body.scrollTop = 0;
      const exRoot = body.querySelector('.ex');
      CC.exercise.bind(ex, exRoot,
        ready => { btn.disabled = !ready; },
        ok => { resolve(ok); });
      progress();
    }

    function resolve(forcedOk) {
      if (answered) return;
      answered = true;
      const exRoot = body.querySelector('.ex');
      const res = typeof forcedOk === 'boolean'
        ? { ok: forcedOk, right: CC.exercise.check(ex, exRoot).right }
        : CC.exercise.check(ex, exRoot);

      CC.store.recordAnswer(ex.card.unit, res.ok);
      done++;
      progress();

      if (res.ok) {
        correct++; combo++; bestCombo = Math.max(bestCombo, combo);
        xp += 10 + (combo >= 5 ? 5 : 0);
        CC.fx.sfx.correct(); CC.fx.buzz(15);
      } else {
        combo = 0;
        wrongCards.push(ex.card);
        CC.fx.sfx.wrong(); CC.fx.buzz([20, 60, 20]);
        if (cfg.hearts) {
          const left = CC.store.loseHeart();
          heartsEl.textContent = left;
          heartsEl.parentElement.classList.add('pulse');
          setTimeout(() => heartsEl.parentElement.classList.remove('pulse'), 500);
          if (left === 0) return outOfHearts();
        }
        if (cfg.repeatWrong) queue.push(CC.exercise.forCard(ex.card));
      }

      if (cfg.instantFeedback === false) { next(); return; }

      sheet.className = 'sheet ' + (res.ok ? 'ok' : 'bad');
      sheet.innerHTML = `
        <div class="sheet-in">
          <p class="sheet-tt">${res.ok ? (combo >= 5 ? '¡Racha de ' + combo + '! 🔥' : CC.util.pick(['¡Correcto!', '¡Muy bien!', '¡Perfecto!', '¡Eso es!'])) : 'Respuesta correcta'}</p>
          ${res.ok ? '' : '<pre class="sheet-ans">' + esc(res.right) + '</pre>'}
          <p class="sheet-ref">${esc(CC.util.refLabel(ex.card))}</p>
          <button class="btn ${res.ok ? 'ok' : 'bad'} big" type="button" data-next>CONTINUAR</button>
        </div>`;
      sheet.hidden = false;
      sheet.querySelector('[data-next]').addEventListener('click', next);
    }

    function outOfHearts() {
      root.innerHTML = `
        <div class="end">
          <div class="end-av">${CC.avatars.svg('lia', 120)}</div>
          <h2>Te quedaste sin corazones</h2>
          <p class="end-sub">Haz un repaso Anki para recuperar uno, o espera ${CC.util.humanDelay(CC.store.heartTimer())}.</p>
          <div class="end-actions">
            <button class="btn primary big" type="button" data-rev>IR AL REPASO</button>
            <button class="btn ghost big" type="button" data-home>VOLVER A LA RUTA</button>
          </div>
        </div>`;
      root.querySelector('[data-rev]').addEventListener('click', () => CC.app.go('review'));
      root.querySelector('[data-home]').addEventListener('click', () => CC.app.go('home'));
    }

    function finish() {
      const acc = total ? correct / (correct + wrongCards.length || 1) : 0;
      cfg.onFinish({ root, correct, total, wrongCards, xp, bestCombo, acc,
                     seconds: Math.round((Date.now() - startedAt) / 1000) });
    }

    btn.addEventListener('click', () => {
      if (answered) return;
      resolve();
    });

    next();
  }

  /* ── Lección ─────────────────────────────────────────── */
  CC.app.register('lesson', {
    chrome: false,
    tab: 'home',
    render(root, lessonId) {
      const lesson = CC.store.lessonById(lessonId);
      if (!lesson) return CC.app.go('home');
      if (CC.store.hearts() === 0) {
        root.innerHTML = `<div class="end">
            <div class="end-av">${CC.avatars.svg('chispa', 110)}</div>
            <h2>Sin corazones</h2>
            <p class="end-sub">Recupera uno haciendo repaso Anki (5 fichas) o espera ${CC.util.humanDelay(CC.store.heartTimer())}.</p>
            <div class="end-actions">
              <button class="btn primary big" type="button" data-rev>IR AL REPASO</button>
              <button class="btn ghost big" type="button" data-home>VOLVER</button>
            </div>
          </div>`;
        root.querySelector('[data-rev]').addEventListener('click', () => CC.app.go('review'));
        root.querySelector('[data-home]').addEventListener('click', () => CC.app.go('home'));
        return;
      }

      const cards = lesson.cards.map(id => CC.CARD_BY_ID[id]);
      const exercises = CC.util.shuffle(CC.exercise.forCards(cards));

      runSession(root, {
        exercises, hearts: true, repeatWrong: true, backTo: 'home',
        onFinish(r) {
          const stars = r.wrongCards.length === 0 ? 3 : r.wrongCards.length <= 2 ? 2 : 1;
          const bonus = 20 + (stars === 3 ? 20 : 0);
          CC.store.completeLesson(lessonId, stars, r.xp + bonus);
          CC.fx.sfx.win(); CC.fx.confetti();
          const u = CC.util.unitOf(lesson.unit);
          r.root.innerHTML = `
            <div class="end">
              <div class="end-av bob">${CC.avatars.svg(CC.store.get().profile.avatar, 130)}</div>
              <h2>¡Lección completada!</h2>
              <p class="end-stars">${'★'.repeat(stars)}${'☆'.repeat(3 - stars)}</p>
              <div class="end-stats">
                <div class="st"><b>+${r.xp + bonus}</b><span>XP</span></div>
                <div class="st"><b>${Math.round(r.acc * 100)}%</b><span>acierto</span></div>
                <div class="st"><b>${r.bestCombo}</b><span>racha máx.</span></div>
              </div>
              <p class="end-sub">${esc(u.name)} · ${lesson.cards.length} fichas añadidas a tu mazo Anki</p>
              <div class="end-actions">
                <button class="btn primary big" type="button" data-home>SEGUIR</button>
              </div>
            </div>`;
          r.root.querySelector('[data-home]').addEventListener('click', () => { CC.app.go('home'); });
          CC.app.celebrate();
        }
      });
    }
  });

  /* ── Simulacro de examen ─────────────────────────────── */
  CC.app.register('exam', {
    tab: 'exam',
    render(root) {
      const s = CC.store.get();
      root.innerHTML = `
        <div class="panel">
          <div class="panel-hero">${CC.avatars.svg('jet', 96)}</div>
          <h1>Simulacro de examen</h1>
          <p class="lead">30 preguntas al azar de todo el temario. Sin corazones y sin pistas: las respuestas se revisan al final. Se aprueba con <b>70%</b>.</p>
          <ul class="facts">
            <li><span>Preguntas</span><b>30</b></li>
            <li><span>Aprobado</span><b>70%</b></li>
            <li><span>Simulacros hechos</span><b>${s.stats.exams || 0}</b></li>
            <li><span>Mejor nota</span><b>${s.stats.examBest || 0}%</b></li>
          </ul>
          <button class="btn primary big full" type="button" data-start>EMPEZAR SIMULACRO</button>
          <button class="btn ghost big full" type="button" data-unit>EXAMEN POR UNIDAD</button>
        </div>`;
      root.querySelector('[data-start]').addEventListener('click', () => CC.app.go('examrun', null));
      root.querySelector('[data-unit]').addEventListener('click', () => {
        root.querySelector('.panel').insertAdjacentHTML('beforeend',
          '<div class="unit-picker">' + CC.UNITS.map(u =>
            `<button class="btn ghost" type="button" data-u="${u.id}">${u.icon} ${esc(u.name)}</button>`).join('') + '</div>');
        root.querySelectorAll('[data-u]').forEach(b =>
          b.addEventListener('click', () => CC.app.go('examrun', b.dataset.u)));
      });
    }
  });

  CC.app.register('examrun', {
    chrome: false,
    tab: 'exam',
    render(root, unitId) {
      const pool = unitId ? CC.CARDS.filter(c => c.unit === unitId) : CC.CARDS;
      const n = Math.min(unitId ? pool.length : 30, pool.length);
      const cards = CC.util.sample(pool, n);
      const exercises = CC.exercise.forCards(cards);

      runSession(root, {
        exercises, hearts: false, repeatWrong: false, instantFeedback: false,
        timer: true, backTo: 'exam',
        onFinish(r) {
          const pct = CC.store.recordExam(r.correct, r.total);
          const pass = pct >= 70;
          CC.store.addXP(r.correct * 5);
          if (pass) { CC.fx.sfx.win(); CC.fx.confetti(); } else { CC.fx.sfx.heartLost(); }
          const byUnit = {};
          r.wrongCards.forEach(c => { byUnit[c.unit] = (byUnit[c.unit] || 0) + 1; });
          const weak = Object.entries(byUnit).sort((a, b) => b[1] - a[1]).slice(0, 3);
          r.root.innerHTML = `
            <div class="end">
              <div class="end-av">${CC.avatars.svg(pass ? 'max' : 'nimbo', 120)}</div>
              <h2>${pass ? '¡Aprobado!' : 'Casi…'}</h2>
              <p class="score ${pass ? 'pass' : 'fail'}">${pct}%</p>
              <div class="end-stats">
                <div class="st"><b>${r.correct}/${r.total}</b><span>aciertos</span></div>
                <div class="st"><b>+${r.correct * 5}</b><span>XP</span></div>
                <div class="st"><b>${Math.floor(r.seconds / 60)}:${CC.util.pad(r.seconds % 60)}</b><span>tiempo</span></div>
              </div>
              ${weak.length ? `<div class="weak">
                <h3>A repasar</h3>
                ${weak.map(([u, n2]) => {
                  const un = CC.util.unitOf(u);
                  return `<div class="weak-row"><span>${un.icon} ${esc(un.name)}</span><b>${n2} fallo${n2 > 1 ? 's' : ''}</b></div>`;
                }).join('')}</div>` : '<p class="end-sub">Sin fallos. Impecable. ✨</p>'}
              ${r.wrongCards.length ? `<details class="misses"><summary>Ver las ${r.wrongCards.length} preguntas falladas</summary>
                ${r.wrongCards.map(c => `<div class="miss"><b>${esc(CC.util.frontText(c))}</b>${CC.util.answerHTML(c)}</div>`).join('')}
              </details>` : ''}
              <div class="end-actions">
                <button class="btn primary big" type="button" data-again>OTRO SIMULACRO</button>
                <button class="btn ghost big" type="button" data-home>VOLVER</button>
              </div>
            </div>`;
          r.root.querySelector('[data-again]').addEventListener('click', () => CC.app.go('examrun', unitId));
          r.root.querySelector('[data-home]').addEventListener('click', () => CC.app.go('home'));
          CC.app.celebrate();
        }
      });
    }
  });
})();
