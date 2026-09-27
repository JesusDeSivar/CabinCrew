/* Pantalla principal: la ruta de vuelo con las unidades y lecciones. */
window.CC = window.CC || {};

CC.app.register('home', {
  tab: 'home',
  render(root) {
    const s = CC.store.get();
    const esc = CC.util.esc;
    const due = CC.store.dueCards().length;
    const nuevas = CC.store.newCards().length;
    const next = CC.store.nextLesson();
    const goalPct = Math.min(1, s.daily.xp / (s.daily.goal || 50));
    const name = s.profile.name ? s.profile.name.split(' ')[0] : 'tripulante';

    let msg;
    const h = new Date().getHours();
    if (CC.store.hearts() === 0) msg = 'Sin corazones. Haz un repaso Anki y te devuelvo uno. 💙';
    else if (due > 0) msg = `Tienes <b>${due}</b> ficha${due > 1 ? 's' : ''} lista${due > 1 ? 's' : ''} para repasar.`;
    else if (s.streak.current >= 3) msg = `¡${s.streak.current} días seguidos! No rompas la racha. 🔥`;
    else if (h < 12) msg = `Buenos días, ${esc(name)}. Vuelo listo para despegar. ☀️`;
    else if (h > 21) msg = `Vuelo nocturno, ${esc(name)}. Una lección corta y a dormir. 🌙`;
    else msg = `¿Repasamos, ${esc(name)}? Te toca la unidad de ${esc(next ? CC.util.unitOf(next.unit).name.toLowerCase() : 'repaso')}.`;

    const course = CC.course();
    const src = CC.sourceId();
    // con todos los orígenes a la vista, cada uno abre su tramo de la ruta con un rótulo
    const heads = {};
    if (course.sources && src === 'all') {
      course.sources.forEach(o => {
        const first = CC.UNITS.find(u => u.src === o.id);
        if (first) heads[first.id] = o;
      });
    }

    const units = CC.UNITS.map(u => {
      const prog = CC.store.unitProgress(u.id);
      const lessons = CC.store.lessonsOfUnit(u.id);
      const nodes = lessons.map((l, i) => {
        const st = CC.store.lessonState(l.id);
        const rec = s.lessons[l.id];
        const off = [0, 1, 2, 1, 0, -1, -2, -1][i % 8];
        const isNext = next && next.id === l.id;
        return `<div class="node-wrap" style="--off:${off}">
            ${isNext ? '<span class="node-flag">EMPEZAR</span>' : ''}
            <button class="node ${st} ${isNext ? 'next' : ''}" type="button" ${st === 'locked' ? 'disabled' : ''}
                    data-lesson="${l.id}" aria-label="Lección ${i + 1} de ${esc(u.name)}">
              <span class="node-ic">${st === 'done' ? '★' : st === 'locked' ? '🔒' : u.icon}</span>
            </button>
            ${rec && rec.done ? `<span class="node-stars">${'★'.repeat(rec.stars)}${'☆'.repeat(3 - rec.stars)}</span>` : ''}
          </div>`;
      }).join('');

      const head = heads[u.id];
      return `${head ? `<h2 class="src-head"><span class="src-tag ${head.id}">${esc(head.tag)}</span>
            ${esc(head.name)} <small>${CC.util.sourceCount(course.id, head.id)} fichas${head.blurb ? ' · ' + esc(head.blurb) : ''}</small></h2>` : ''}
        <section class="unit" style="--hue:${u.hue}">
          <header class="unit-head">
            <span class="unit-ic">${u.icon}</span>
            <div class="unit-tt">
              <h2>${esc(u.name)}</h2>
              <p>${esc(u.blurb)}</p>
            </div>
            <span class="unit-prog">${prog.done}/${prog.total}</span>
          </header>
          <div class="path">${nodes}</div>
        </section>`;
    }).join('');

    const switcher = `<div class="course-switch" role="group" aria-label="Curso">
        ${CC.COURSES.map(c => `<button class="course-opt ${c.id === course.id ? 'on' : ''}" type="button"
            data-course="${c.id}" aria-pressed="${c.id === course.id}">
            <span class="course-ic">${c.icon}</span><span>${esc(c.short)}</span></button>`).join('')}
      </div>`;

    root.innerHTML = `
      ${switcher}
      ${CC.util.sourceSwitch()}
      <div class="greet">
        <div class="greet-av">${CC.avatars.svg(s.profile.avatar, 84)}</div>
        <div class="bubble"><p>${msg}</p></div>
      </div>

      <div class="cta-grid">
        <button class="card cta review-cta" type="button" data-goto="review">
          <span class="cta-ic">🧠</span>
          <span class="cta-tt">Repaso Anki</span>
          <span class="cta-sub">${due} para hoy · ${nuevas} nuevas</span>
        </button>
        <div class="card cta goal">
          <svg class="ring" viewBox="0 0 48 48" aria-hidden="true">
            <circle cx="24" cy="24" r="20" class="ring-bg"/>
            <circle cx="24" cy="24" r="20" class="ring-fg" style="stroke-dasharray:${(goalPct * 125.6).toFixed(1)} 125.6"/>
          </svg>
          <span class="cta-tt">Meta diaria</span>
          <span class="cta-sub">${s.daily.xp} / ${s.daily.goal} XP</span>
        </div>
      </div>

      ${units}
      <p class="foot-note">Contenido: ${esc(course.sources
        ? course.sources.filter(o => src === 'all' || o.id === src).map(o => o.name).join(' + ')
        : course.blurb.toLowerCase())} · ${CC.CARDS.length} fichas</p>`;

    root.querySelectorAll('[data-course]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.course === CC.courseId()) return;
      CC.fx.sfx.tap();
      CC.store.setCourse(b.dataset.course);
      CC.app.go('home');
    }));

    CC.util.bindSourceSwitch(root);

    root.querySelectorAll('[data-lesson]').forEach(b =>
      b.addEventListener('click', () => CC.app.go('lesson', b.dataset.lesson)));
    root.querySelector('[data-goto]').addEventListener('click', () => CC.app.go('review'));

    const nextEl = root.querySelector('.node.next');
    if (nextEl && !sessionStorage.getItem('cc.scrolled')) {
      try { sessionStorage.setItem('cc.scrolled', '1'); } catch (e) {}
    }
  }
});
