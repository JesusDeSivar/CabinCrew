/* Repaso Anki: fichas con repetición espaciada SM-2. */
window.CC = window.CC || {};

CC.app.register('review', {
  tab: 'review',
  render(root) {
    const esc = CC.util.esc;
    const q = CC.store.reviewQueue();
    const counts = CC.store.srsCounts();
    const heartTip = CC.store.hearts() < CC.store.HEART_MAX
      ? '<p class="tip">💙 Cada 5 fichas repasadas recuperas un corazón.</p>' : '';

    if (!q.all.length) {
      root.innerHTML = `
        <div class="panel">
          <div class="panel-hero">${CC.avatars.svg('luna', 96)}</div>
          <h1>Mazo al día</h1>
          <p class="lead">No hay fichas pendientes ahora mismo. Vuelve cuando toque o haz un repaso libre para no perder práctica.</p>
          <div class="srs-grid">
            <div class="srs-cell"><b>${counts.new}</b><span>nuevas</span></div>
            <div class="srs-cell"><b>${counts.learning}</b><span>aprendiendo</span></div>
            <div class="srs-cell"><b>${counts.young}</b><span>jóvenes</span></div>
            <div class="srs-cell"><b>${counts.mature}</b><span>maduras</span></div>
          </div>
          <button class="btn primary big full" type="button" data-free>REPASO LIBRE (20 fichas)</button>
          <button class="btn ghost big full" type="button" data-home>VOLVER A LA RUTA</button>
        </div>`;
      root.querySelector('[data-free]').addEventListener('click', () =>
        CC.app.go('reviewrun', { free: true }));
      root.querySelector('[data-home]').addEventListener('click', () => CC.app.go('home'));
      return;
    }

    root.innerHTML = `
      <div class="panel">
        <div class="panel-hero">${CC.avatars.svg('tito', 96)}</div>
        <h1>Repaso Anki</h1>
        <p class="lead">Repetición espaciada: cada ficha vuelve justo antes de que la olvides.</p>
        <div class="srs-grid">
          <div class="srs-cell due"><b>${q.due.length}</b><span>por repasar</span></div>
          <div class="srs-cell new"><b>${q.fresh.length}</b><span>nuevas hoy</span></div>
          <div class="srs-cell"><b>${counts.young + counts.mature}</b><span>aprendidas</span></div>
          <div class="srs-cell"><b>${counts.mature}</b><span>maduras</span></div>
        </div>
        ${heartTip}
        <button class="btn primary big full" type="button" data-go>EMPEZAR (${q.all.length})</button>
        <button class="btn ghost big full" type="button" data-home>VOLVER</button>
      </div>`;
    root.querySelector('[data-go]').addEventListener('click', () => CC.app.go('reviewrun', {}));
    root.querySelector('[data-home]').addEventListener('click', () => CC.app.go('home'));
  }
});

CC.app.register('reviewrun', {
  chrome: false,
  tab: 'review',
  render(root, opts) {
    opts = opts || {};
    const esc = CC.util.esc;
    let queue = opts.free
      ? CC.util.sample(CC.CARDS, 20)
      : CC.store.reviewQueue().all.slice();
    if (!queue.length) return CC.app.go('review');

    const total = queue.length;
    let done = 0, again = 0, good = 0, xp = 0, hearts = 0;
    const startedAt = Date.now();

    root.innerHTML = `
      <div class="q-top">
        <button class="q-close" type="button" aria-label="Salir">✕</button>
        <div class="q-bar"><i style="width:0%"></i></div>
        <span class="q-hearts q-count">🧠 <b>${total}</b></span>
      </div>
      <div class="flash-wrap"></div>`;

    const wrap = root.querySelector('.flash-wrap');
    const bar = root.querySelector('.q-bar i');
    const left = root.querySelector('.q-hearts b');
    root.querySelector('.q-close').addEventListener('click', () => finish(true));

    function show() {
      if (!queue.length) return finish();
      const card = queue[0];
      const u = CC.util.unitOf(card.unit);
      const srsCard = CC.store.srsCard(card.id);
      const state = CC.srs.bucket(srsCard);
      const stateLabel = { new: 'Nueva', learning: 'Aprendiendo', young: 'Joven', mature: 'Madura' }[state];
      left.textContent = queue.length;
      bar.style.width = Math.round((done / total) * 100) + '%';

      wrap.innerHTML = `
        <article class="flash">
          <div class="flash-meta">
            <span class="chip" style="--hue:${u.hue}">${u.icon} ${esc(u.name)}</span>
            <span class="chip state ${state}">${stateLabel}</span>
          </div>
          <div class="flash-front">
            <p class="flash-q">${esc(CC.util.frontText(card))}</p>
            ${card.type === 'def' && card.term ? `<p class="flash-hint">${esc(card.q)}</p>` : ''}
          </div>
          <div class="flash-back" hidden>
            <div class="flash-a">${CC.util.answerHTML(card)}</div>
            <p class="flash-ref">${esc(CC.util.refLabel(card))}</p>
          </div>
        </article>
        <div class="flash-actions">
          <button class="btn primary big full" type="button" data-show>MOSTRAR RESPUESTA</button>
        </div>`;

      wrap.querySelector('[data-show]').addEventListener('click', () => reveal(card, srsCard));
    }

    function reveal(card, srsCard) {
      CC.fx.sfx.flip(); CC.fx.buzz(10);
      wrap.querySelector('.flash-back').hidden = false;
      const prev = CC.srs.preview(srsCard);
      const labels = [
        { g: 0, t: 'Otra vez', cls: 'g0' },
        { g: 1, t: 'Difícil', cls: 'g1' },
        { g: 2, t: 'Bien', cls: 'g2' },
        { g: 3, t: 'Fácil', cls: 'g3' }
      ];
      wrap.querySelector('.flash-actions').innerHTML =
        '<div class="grades">' + labels.map(l =>
          `<button class="grade ${l.cls}" type="button" data-g="${l.g}">
             <b>${l.t}</b><span>${prev[l.g]}</span></button>`).join('') + '</div>';
      wrap.querySelectorAll('[data-g]').forEach(b =>
        b.addEventListener('click', () => grade(card, +b.dataset.g)));
    }

    function grade(card, g) {
      CC.store.gradeCard(card.id, g);
      queue.shift();
      done++;
      if (g === 0) { again++; queue.push(card); CC.fx.sfx.wrong(); }
      else { good++; CC.fx.sfx.correct(); }
      CC.fx.buzz(12);
      xp += g === 0 ? 2 : 5;
      if (done % 5 === 0 && CC.store.hearts() < CC.store.HEART_MAX) { CC.store.gainHeart(1); hearts++; }
      show();
    }

    function finish(early) {
      CC.store.addXP(xp);
      CC.store.get().daily.reviews += done;
      CC.store.save();
      if (!done) return CC.app.go('review');
      if (!early) { CC.fx.sfx.win(); CC.fx.confetti({ count: 60 }); }
      const mins = Math.max(1, Math.round((Date.now() - startedAt) / 60000));
      root.innerHTML = `
        <div class="end">
          <div class="end-av bob">${CC.avatars.svg('luna', 120)}</div>
          <h2>${early ? 'Repaso pausado' : '¡Repaso terminado!'}</h2>
          <div class="end-stats">
            <div class="st"><b>${done}</b><span>fichas</span></div>
            <div class="st"><b>+${xp}</b><span>XP</span></div>
            <div class="st"><b>${mins} min</b><span>sesión</span></div>
          </div>
          <p class="end-sub">${good} recordadas · ${again} repetidas${hearts ? ' · +' + hearts + ' ❤️' : ''}</p>
          <div class="end-actions">
            <button class="btn primary big" type="button" data-home>VOLVER A LA RUTA</button>
            <button class="btn ghost big" type="button" data-more>SEGUIR REPASANDO</button>
          </div>
        </div>`;
      root.querySelector('[data-home]').addEventListener('click', () => CC.app.go('home'));
      root.querySelector('[data-more]').addEventListener('click', () => CC.app.go('review'));
      CC.app.celebrate();
    }

    show();
  }
});
