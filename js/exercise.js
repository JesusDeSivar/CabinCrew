/* Generación y render de ejercicios a partir de las fichas del examen. */
window.CC = window.CC || {};

CC.exercise = (function () {
  const U = () => CC.util;

  /* ── Generación ──────────────────────────────────────── */

  function distractorsFor(card, n) {
    const pool = CC.CARDS.filter(c => c.id !== card.id && (c.type === 'def' || c.type === 'num') && c.a);
    const same = U().shuffle(pool.filter(c => c.unit === card.unit)).map(c => c.a);
    const rest = U().shuffle(pool.filter(c => c.unit !== card.unit)).map(c => c.a);
    const out = [];
    [...same, ...rest].forEach(a => { if (out.length < n && a !== card.a && !out.includes(a)) out.push(a); });
    return out;
  }

  function termDistractors(card, n) {
    const pool = CC.CARDS.filter(c => c.id !== card.id && c.type === 'def' && c.term);
    const same = U().shuffle(pool.filter(c => c.unit === card.unit)).map(c => c.term);
    const rest = U().shuffle(pool.filter(c => c.unit !== card.unit)).map(c => c.term);
    const out = [];
    [...same, ...rest].forEach(t => { if (out.length < n && t !== card.term && !out.includes(t)) out.push(t); });
    return out;
  }

  function choice(card, prompt, correct, others, sub) {
    const options = U().shuffle([{ text: correct, ok: true }].concat(others.map(t => ({ text: t, ok: false }))));
    return { kind: 'choice', card, prompt, sub, options, correct };
  }

  function forCard(card, opts) {
    opts = opts || {};
    switch (card.type) {
      case 'def': {
        const reverse = card.term && !opts.forward && Math.random() < 0.4;
        if (reverse) {
          return choice(card, '¿A qué corresponde esta definición?', card.term, termDistractors(card, 3), '«' + card.a + '»');
        }
        return choice(card, card.q, card.a, distractorsFor(card, 3));
      }
      case 'num':
        return choice(card, card.q, card.a, card.options.filter(o => o !== card.a).slice(0, 3));

      case 'list': {
        if (card.items.length > 3 && Math.random() < 0.45) {
          const lure = U().pick(card.lures);
          return choice(card, '¿Cuál NO pertenece a: ' + card.q.replace(/^¿|\?$/g, '') + '?', lure, U().sample(card.items, 3));
        }
        const needed = Math.min(3, card.items.length);
        const right = U().sample(card.items, needed).map(t => ({ text: t, ok: true }));
        const wrong = U().sample(card.lures, Math.max(2, Math.min(3, card.lures.length))).map(t => ({ text: t, ok: false }));
        return { kind: 'multi', card, prompt: card.q, sub: 'Elige ' + needed + ' correctas',
                 options: U().shuffle(right.concat(wrong)), needed };
      }

      case 'order': {
        const steps = card.steps;
        let window_ = steps, from = 0;
        if (steps.length > 5) {
          const size = 4;
          from = Math.floor(Math.random() * (steps.length - size + 1));
          window_ = steps.slice(from, from + size);
        }
        return { kind: 'order', card, prompt: card.q,
                 sub: steps.length > 5 ? 'Ordena estos ' + window_.length + ' pasos del procedimiento' : 'Toca los pasos en orden',
                 correct: window_, items: U().shuffle(window_), from };
      }

      case 'match':
        return { kind: 'match', card, prompt: card.prompt || card.q, sub: 'Une cada par',
                 pairs: card.pairs.slice() };
    }
    return choice(card, card.q, card.a || '', distractorsFor(card, 3));
  }

  function forCards(cards, opts) { return cards.map(c => forCard(c, opts)); }

  /* ── Render ──────────────────────────────────────────── */

  const KEYS = ['A', 'B', 'C', 'D', 'E', 'F'];

  function render(ex) {
    const esc = U().esc;
    let body = '';
    if (ex.kind === 'choice' || ex.kind === 'multi') {
      body = '<div class="opts" role="group">' + ex.options.map((o, i) =>
        `<button class="opt" type="button" data-i="${i}">
           <span class="opt-key">${KEYS[i]}</span><span class="opt-txt">${esc(o.text)}</span>
         </button>`).join('') + '</div>';
    } else if (ex.kind === 'order') {
      body = `<div class="slots" data-slots aria-label="Orden elegido">
                ${ex.correct.map((_, i) => `<div class="slot" data-slot="${i}"><span class="slot-n">${i + 1}</span><span class="slot-txt"></span></div>`).join('')}
              </div>
              <div class="bank" data-bank>
                ${ex.items.map((t, i) => `<button class="chip" type="button" data-chip="${i}">${esc(t)}</button>`).join('')}
              </div>`;
    } else if (ex.kind === 'match') {
      const left = ex.pairs.map((p, i) => ({ t: p[0], i }));
      const right = U().shuffle(ex.pairs.map((p, i) => ({ t: p[1], i })));
      body = `<div class="match">
        <div class="mcol">${left.map(x => `<button class="mchip" type="button" data-side="l" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
        <div class="mcol">${right.map(x => `<button class="mchip" type="button" data-side="r" data-i="${x.i}">${esc(x.t)}</button>`).join('')}</div>
      </div>`;
    }
    return `<div class="ex" data-kind="${ex.kind}">
        <p class="ex-prompt">${esc(ex.prompt)}</p>
        ${ex.sub ? `<p class="ex-sub">${esc(ex.sub)}</p>` : ''}
        ${body}
      </div>`;
  }

  /* Conecta la interacción. onState(ready) avisa si ya se puede comprobar;
     onAuto(ok) se usa en los emparejamientos, que se resuelven solos. */
  function bind(ex, root, onState, onAuto) {
    if (ex.kind === 'choice') {
      root.querySelectorAll('.opt').forEach(btn => {
        btn.addEventListener('click', () => {
          root.querySelectorAll('.opt').forEach(b => b.classList.remove('sel'));
          btn.classList.add('sel');
          ex.chosen = +btn.dataset.i;
          CC.fx.sfx.tap(); CC.fx.buzz(8);
          onState(true);
        });
      });
    } else if (ex.kind === 'multi') {
      ex.chosen = new Set();
      root.querySelectorAll('.opt').forEach(btn => {
        btn.addEventListener('click', () => {
          const i = +btn.dataset.i;
          if (ex.chosen.has(i)) { ex.chosen.delete(i); btn.classList.remove('sel'); }
          else { ex.chosen.add(i); btn.classList.add('sel'); }
          CC.fx.sfx.tap(); CC.fx.buzz(8);
          onState(ex.chosen.size === ex.needed);
        });
      });
    } else if (ex.kind === 'order') {
      ex.placed = [];
      const slots = root.querySelectorAll('.slot');
      const redraw = () => {
        slots.forEach((s, i) => {
          const val = ex.placed[i];
          s.querySelector('.slot-txt').textContent = val ? val.text : '';
          s.classList.toggle('filled', !!val);
        });
        onState(ex.placed.length === ex.correct.length);
      };
      root.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (chip.classList.contains('used')) {
            const idx = ex.placed.findIndex(p => p.el === chip);
            if (idx >= 0) ex.placed.splice(idx, 1);
            chip.classList.remove('used');
          } else if (ex.placed.length < ex.correct.length) {
            chip.classList.add('used');
            ex.placed.push({ el: chip, text: chip.textContent });
          }
          CC.fx.sfx.tap(); CC.fx.buzz(8);
          redraw();
        });
      });
      redraw();
    } else if (ex.kind === 'match') {
      ex.mistakes = 0; ex.matched = 0;
      let sel = null;
      root.querySelectorAll('.mchip').forEach(chip => {
        chip.addEventListener('click', () => {
          if (chip.classList.contains('done')) return;
          if (sel && sel.dataset.side === chip.dataset.side) { sel.classList.remove('sel'); sel = null; }
          if (!sel) { sel = chip; chip.classList.add('sel'); CC.fx.sfx.tap(); return; }
          const ok = sel.dataset.i === chip.dataset.i;
          if (ok) {
            [sel, chip].forEach(c => { c.classList.remove('sel'); c.classList.add('done'); });
            ex.matched++;
            CC.fx.sfx.correct(); CC.fx.buzz(12);
            if (ex.matched === ex.pairs.length) onAuto(ex.mistakes === 0);
          } else {
            ex.mistakes++;
            [sel, chip].forEach(c => { c.classList.add('shake'); setTimeout(() => c.classList.remove('shake'), 400); });
            sel.classList.remove('sel');
            CC.fx.sfx.wrong(); CC.fx.buzz([12, 40, 12]);
          }
          sel = null;
        });
      });
      onState(false);
    }
  }

  /* Evalúa y pinta el resultado dentro del propio ejercicio */
  function check(ex, root) {
    if (ex.kind === 'choice') {
      const opts = root.querySelectorAll('.opt');
      const ok = ex.options[ex.chosen] && ex.options[ex.chosen].ok;
      opts.forEach((b, i) => {
        b.disabled = true;
        if (ex.options[i].ok) b.classList.add('right');
        else if (i === ex.chosen) b.classList.add('bad');
      });
      return { ok, right: ex.correct };
    }
    if (ex.kind === 'multi') {
      const opts = root.querySelectorAll('.opt');
      let ok = true;
      ex.options.forEach((o, i) => {
        const chosen = ex.chosen.has(i);
        if (o.ok !== chosen) ok = false;
        opts[i].disabled = true;
        if (o.ok) opts[i].classList.add('right');
        else if (chosen) opts[i].classList.add('bad');
      });
      return { ok, right: ex.options.filter(o => o.ok).map(o => o.text).join(' · ') };
    }
    if (ex.kind === 'order') {
      const ok = ex.placed.every((p, i) => p.text === ex.correct[i]);
      root.querySelectorAll('.slot').forEach((s, i) => {
        if (!ex.placed[i]) return;
        s.classList.add(ex.placed[i].text === ex.correct[i] ? 'right' : 'bad');
      });
      root.querySelectorAll('.chip').forEach(c => { c.disabled = true; });
      return { ok, right: ex.correct.map((t, i) => (i + 1) + '. ' + t).join('\n') };
    }
    if (ex.kind === 'match') {
      return { ok: ex.mistakes === 0, right: ex.pairs.map(p => p[0] + ' → ' + p[1]).join('\n') };
    }
    return { ok: false, right: '' };
  }

  return { forCard, forCards, render, bind, check };
})();
