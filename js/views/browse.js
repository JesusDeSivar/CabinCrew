/* Manual de fichas: buscar y consultar todo el temario. */
window.CC = window.CC || {};

CC.app.register('browse', {
  tab: 'browse',
  render(root) {
    const esc = CC.util.esc;
    let filter = 'all', query = '';

    root.innerHTML = `
      <div class="browse-head">
        <h1>Fichas del examen</h1>
        <input class="search" type="search" id="browse-search" placeholder="Buscar: APU, hipoxia, anexo 6…"
               autocomplete="off" aria-label="Buscar en las fichas">
        <div class="filters" role="group" aria-label="Filtrar por unidad">
          <button class="fchip on" type="button" data-f="all">Todas</button>
          ${CC.UNITS.map(u => `<button class="fchip" type="button" data-f="${u.id}" style="--hue:${u.hue}">${u.icon} ${esc(u.name)}</button>`).join('')}
        </div>
      </div>
      <div class="cards-list"></div>`;

    const list = root.querySelector('.cards-list');
    const search = root.querySelector('#browse-search');

    function draw() {
      const q = query.trim().toLowerCase();
      const cards = CC.CARDS.filter(c => {
        if (filter !== 'all' && c.unit !== filter) return false;
        if (!q) return true;
        const hay = [CC.util.frontText(c), c.q, CC.util.answerText(c)].join(' ').toLowerCase();
        return hay.includes(q);
      });

      if (!cards.length) {
        list.innerHTML = `<p class="empty">Sin resultados para «${esc(query)}».</p>`;
        return;
      }

      list.innerHTML = cards.map(c => {
        const u = CC.util.unitOf(c.unit);
        const sc = CC.store.get().srs[c.id];
        const b = CC.srs.bucket(sc);
        const label = { new: 'sin ver', learning: 'aprendiendo', young: 'joven', mature: 'madura' }[b];
        const due = sc && sc.due ? (sc.due <= Date.now() ? 'lista' : 'en ' + CC.util.humanDelay(sc.due - Date.now())) : '';
        return `<details class="bcard" style="--hue:${u.hue}">
            <summary>
              <span class="bcard-ic">${u.icon}</span>
              <span class="bcard-q">${esc(CC.util.frontText(c))}</span>
              <span class="bcard-state ${b}">${label}</span>
            </summary>
            <div class="bcard-body">
              ${c.type === 'def' && c.term ? `<p class="bcard-sub">${esc(c.q)}</p>` : ''}
              ${CC.util.answerHTML(c)}
              <p class="bcard-foot">${esc(CC.util.refLabel(c))}${due ? ' · repaso ' + due : ''}</p>
            </div>
          </details>`;
      }).join('');
    }

    search.addEventListener('input', e => { query = e.target.value; draw(); });
    root.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => {
      filter = b.dataset.f;
      root.querySelectorAll('[data-f]').forEach(x => x.classList.toggle('on', x === b));
      CC.fx.sfx.tap();
      draw();
    }));

    draw();
  }
});
