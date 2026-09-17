/* Perfil: progreso, personajes, logros y ajustes. */
window.CC = window.CC || {};

CC.app.register('profile', {
  tab: 'profile',
  render(root, tab) {
    const esc = CC.util.esc;
    const s = CC.store.get();
    const li = CC.store.levelInfo();
    tab = tab || 'progreso';

    root.innerHTML = `
      <header class="prof-head">
        <div class="prof-av">${CC.avatars.svg(s.profile.avatar, 92)}</div>
        <div class="prof-id">
          <h1>${esc(s.profile.name || 'Tripulante')}</h1>
          <p class="rank">${esc(li.rank)} · nivel ${li.level}</p>
          <div class="xp-bar"><i style="width:${Math.round(li.pct * 100)}%"></i></div>
          <p class="xp-txt">${li.into} / ${li.need} XP para el nivel ${li.level + 1}</p>
        </div>
      </header>
      <div class="seg" role="tablist">
        ${['progreso', 'personajes', 'logros', 'ajustes'].map(t =>
          `<button class="seg-b ${t === tab ? 'on' : ''}" type="button" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}
      </div>
      <div class="pane"></div>`;

    root.querySelectorAll('[data-t]').forEach(b =>
      b.addEventListener('click', () => { CC.fx.sfx.tap(); CC.app.go('profile', b.dataset.t); }));

    const pane = root.querySelector('.pane');
    ({ progreso, personajes, logros, ajustes }[tab] || progreso)(pane);
  }
});

/* ── Progreso ─────────────────────────────────────────── */
function progreso(pane) {
  const s = CC.store.get();
  const esc = CC.util.esc;
  const counts = CC.store.srsCounts();
  const week = CC.store.weekHistory();
  const acc = Math.round(CC.store.accuracy() * 100);
  const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

  /* Gráfico de XP de los últimos 7 días: una sola serie, un solo tono */
  const W = 300, H = 132, padL = 4, padB = 26, padT = 18;
  const max = Math.max(s.daily.goal || 50, ...week.map(d => d.xp), 10);
  const bw = 30, gap = (W - padL * 2 - bw * 7) / 6;
  const goalY = padT + (1 - (s.daily.goal || 50) / max) * (H - padT - padB);
  const bars = week.map((d, i) => {
    const x = padL + i * (bw + gap);
    const h = Math.max(d.xp > 0 ? 4 : 2, (d.xp / max) * (H - padT - padB));
    const y = H - padB - h;
    const r = Math.min(4, h);
    const path = `M${x} ${y + h} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} L${x + bw - r} ${y} Q${x + bw} ${y} ${x + bw} ${y + r} L${x + bw} ${y + h} Z`;
    const dayLabel = DAYS[new Date(d.key + 'T12:00:00').getDay()];
    const showVal = d.xp > 0 && (d.today || d.xp === Math.max(...week.map(w => w.xp)));
    return `
      <path d="${path}" class="bar ${d.xp ? '' : 'zero'} ${d.today ? 'today' : ''}"><title>${esc(d.key)}: ${d.xp} XP</title></path>
      ${showVal ? `<text class="bar-val" x="${x + bw / 2}" y="${y - 5}" text-anchor="middle">${d.xp}</text>` : ''}
      <text class="bar-lb ${d.today ? 'on' : ''}" x="${x + bw / 2}" y="${H - padB + 15}" text-anchor="middle">${dayLabel}</text>`;
  }).join('');

  const unitRows = CC.UNITS.map(u => {
    const p = CC.store.unitProgress(u.id);
    const st = s.stats.byUnit[u.id];
    const a = st && st.answered ? Math.round((st.correct / st.answered) * 100) : null;
    return `<div class="urow" style="--hue:${u.hue}">
        <span class="urow-ic">${u.icon}</span>
        <div class="urow-main">
          <div class="urow-top"><b>${esc(u.name)}</b><span>${p.done}/${p.total}${a !== null ? ' · ' + a + '%' : ''}</span></div>
          <div class="urow-bar"><i style="width:${Math.round(p.pct * 100)}%"></i></div>
        </div>
      </div>`;
  }).join('');

  pane.innerHTML = `
    <div class="tiles">
      <div class="tile"><span class="t-ic">🔥</span><b>${s.streak.current}</b><span>racha actual</span></div>
      <div class="tile"><span class="t-ic">🏅</span><b>${s.streak.best}</b><span>mejor racha</span></div>
      <div class="tile"><span class="t-ic">🎯</span><b>${acc}%</b><span>acierto global</span></div>
      <div class="tile"><span class="t-ic">⚡</span><b>${s.xp}</b><span>XP total</span></div>
    </div>

    <section class="block">
      <h2>Actividad de la semana</h2>
      <svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="XP de los últimos 7 días">
        <line class="goal" x1="0" y1="${goalY.toFixed(1)}" x2="${W}" y2="${goalY.toFixed(1)}"/>
        ${bars}
      </svg>
      <p class="chart-cap"><span class="dash"></span> meta diaria: ${s.daily.goal} XP · hoy en morado</p>
    </section>

    <section class="block">
      <h2>Memoria del mazo</h2>
      <div class="srs-grid">
        <div class="srs-cell"><b>${counts.new}</b><span>sin ver</span></div>
        <div class="srs-cell"><b>${counts.learning}</b><span>aprendiendo</span></div>
        <div class="srs-cell"><b>${counts.young}</b><span>jóvenes</span></div>
        <div class="srs-cell"><b>${counts.mature}</b><span>maduras</span></div>
      </div>
      <p class="hint">«Maduras» son las fichas con intervalos de 21 días o más: las que ya tienes bien fijadas.</p>
    </section>

    <section class="block">
      <h2>Unidades</h2>
      ${unitRows}
    </section>`;
}

/* ── Personajes ───────────────────────────────────────── */
function personajes(pane) {
  const s = CC.store.get();
  const esc = CC.util.esc;
  CC.avatars.refresh();
  pane.innerHTML = `<p class="hint">Toca un personaje desbloqueado para usarlo como tu avatar.</p>
    <div class="av-grid">
      ${CC.avatars.LIST.map(a => {
        const un = s.avatars.unlocked.includes(a.id);
        const on = s.profile.avatar === a.id;
        return `<button class="av-card ${un ? '' : 'locked'} ${on ? 'on' : ''}" type="button"
                  ${un ? '' : 'disabled'} data-av="${a.id}">
            <span class="av-art">${un ? CC.avatars.svg(a.id, 72) : '<span class="av-lock">🔒</span>'}</span>
            <b>${esc(a.name)}</b>
            <small>${esc(un ? a.role : a.how)}</small>
          </button>`;
      }).join('')}
    </div>`;
  pane.querySelectorAll('[data-av]').forEach(b => b.addEventListener('click', () => {
    s.profile.avatar = b.dataset.av;
    CC.store.save();
    CC.fx.sfx.unlock();
    CC.app.go('profile', 'personajes');
  }));
}

/* ── Logros ───────────────────────────────────────────── */
function logros(pane) {
  const s = CC.store.get();
  const esc = CC.util.esc;
  const got = CC.achievements.LIST.filter(a => s.achievements[a.id]).length;
  pane.innerHTML = `<p class="hint">${got} de ${CC.achievements.LIST.length} logros conseguidos.</p>
    <div class="ach-grid">
      ${CC.achievements.LIST.map(a => {
        const on = !!s.achievements[a.id];
        return `<div class="ach ${on ? 'on' : ''}">
            <span class="ach-ic">${on ? a.icon : '🔒'}</span>
            <b>${esc(a.name)}</b><small>${esc(a.desc)}</small>
          </div>`;
      }).join('')}
    </div>`;
}

/* ── Ajustes ──────────────────────────────────────────── */
function ajustes(pane) {
  const s = CC.store.get();
  const esc = CC.util.esc;
  pane.innerHTML = `
    <section class="block form">
      <label class="field">
        <span>Tu nombre</span>
        <input type="text" id="set-name" value="${esc(s.profile.name)}" placeholder="Tripulante" maxlength="24">
      </label>
      <label class="field">
        <span>Meta diaria</span>
        <select id="set-goal">
          ${[20, 50, 100, 150].map(v => `<option value="${v}" ${s.daily.goal === v ? 'selected' : ''}>${v} XP</option>`).join('')}
        </select>
      </label>
      <label class="field">
        <span>Fichas nuevas al día</span>
        <select id="set-new">
          ${[5, 10, 15, 25, 40].map(v => `<option value="${v}" ${s.settings.newPerDay === v ? 'selected' : ''}>${v}</option>`).join('')}
        </select>
      </label>
      <label class="switch"><span>Sonido</span>
        <input type="checkbox" id="set-sound" ${s.settings.sound ? 'checked' : ''}><i></i></label>
      <label class="switch"><span>Vibración</span>
        <input type="checkbox" id="set-haptics" ${s.settings.haptics ? 'checked' : ''}><i></i></label>
    </section>

    <section class="block">
      <h2>Copia de seguridad</h2>
      <p class="hint">Tu progreso vive solo en este dispositivo. Copia el texto para guardarlo o pégalo en otro móvil.</p>
      <textarea id="set-data" class="data-box" rows="4" spellcheck="false"></textarea>
      <div class="row-2">
        <button class="btn ghost" type="button" id="btn-copy">COPIAR</button>
        <button class="btn ghost" type="button" id="btn-import">IMPORTAR</button>
      </div>
    </section>

    <section class="block">
      <h2>Zona de peligro</h2>
      <button class="btn danger full" type="button" id="btn-reset">REINICIAR TODO EL PROGRESO</button>
    </section>`;

  const $ = id => pane.querySelector('#' + id);
  $('set-name').addEventListener('change', e => { s.profile.name = e.target.value.trim(); CC.store.save(); });
  $('set-goal').addEventListener('change', e => { s.daily.goal = +e.target.value; CC.store.save(); });
  $('set-new').addEventListener('change', e => { s.settings.newPerDay = +e.target.value; CC.store.save(); });
  $('set-sound').addEventListener('change', e => { s.settings.sound = e.target.checked; CC.store.save(); });
  $('set-haptics').addEventListener('change', e => { s.settings.haptics = e.target.checked; CC.store.save(); });

  $('set-data').value = JSON.stringify(CC.store.get());
  $('btn-copy').addEventListener('click', async () => {
    const box = $('set-data');
    box.select();
    try { await navigator.clipboard.writeText(box.value); CC.fx.toast('Progreso copiado al portapapeles'); }
    catch (e) { document.execCommand && document.execCommand('copy'); CC.fx.toast('Selecciona y copia el texto'); }
  });
  $('btn-import').addEventListener('click', () => {
    try {
      CC.store.importState(JSON.parse($('set-data').value));
      CC.fx.toast('Progreso importado');
      CC.app.go('profile', 'ajustes');
    } catch (e) { CC.fx.toast('Ese texto no es una copia válida'); }
  });
  $('btn-reset').addEventListener('click', () => {
    if (!confirm('Se borrará tu XP, racha, personajes y mazo Anki. ¿Continuar?')) return;
    CC.store.reset();
    CC.app.go('home');
  });
}
