/* Utilidades compartidas */
window.CC = window.CC || {};

CC.util = (function () {
  const pad = n => String(n).padStart(2, '0');

  function dayKey(d) {
    d = d || new Date();
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
  }
  function addDays(key, n) {
    const [y, m, d] = key.split('-').map(Number);
    const dt = new Date(y, m - 1, d + n);
    return dayKey(dt);
  }
  function daysBetween(a, b) {
    const pa = a.split('-').map(Number), pb = b.split('-').map(Number);
    const da = Date.UTC(pa[0], pa[1] - 1, pa[2]), db = Date.UTC(pb[0], pb[1] - 1, pb[2]);
    return Math.round((db - da) / 86400000);
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function sample(arr, n) { return shuffle(arr).slice(0, n); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, c =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function humanDelay(ms) {
    if (ms <= 0) return 'ahora';
    const min = ms / 60000;
    if (min < 60) return '≤ ' + Math.max(1, Math.round(min)) + ' min';
    const h = min / 60;
    if (h < 24) return Math.round(h) + ' h';
    const d = h / 24;
    if (d < 30) return Math.round(d) + ' d';
    return Math.round(d / 30) + ' meses';
  }

  /* Opción múltiple del banco AAC: verdadero/falso o tres opciones */
  const isTrueFalse = card => card.type === 'mc' && card.options.length === 2;
  const noteHTML = card => card.note ? '<p class="ans-note">' + esc(card.note) + '</p>' : '';

  /* Texto de la cara posterior de una ficha, según su tipo */
  function answerText(card) {
    switch (card.type) {
      case 'list': return card.items.map(i => '• ' + i).join('\n');
      case 'order': return card.steps.map((s, i) => (i + 1) + '. ' + s).join('\n');
      case 'match': return card.pairs.map(p => p[0] + ' → ' + p[1]).join('\n');
      case 'mc': return isTrueFalse(card) ? card.a : card.options.map(o => (o === card.a ? '✓ ' : '• ') + o).join('\n');
      default: return card.a;
    }
  }
  function answerHTML(card) {
    switch (card.type) {
      case 'mc':
        if (isTrueFalse(card)) return '<p class="ans-tf">' + esc(card.a) + '</p>' + noteHTML(card);
        // las tres opciones del examen, con la correcta marcada: «ambas» o «1 y 2» sólo se entienden así
        return '<ol class="ans-list ans-mc">' + card.options.map(o => o === card.a
          ? '<li class="ok"><strong>' + esc(o) + '</strong> <span class="ans-ok">✓ correcta</span></li>'
          : '<li>' + esc(o) + '</li>').join('') + '</ol>' + noteHTML(card);
      case 'list':
        return '<ul class="ans-list">' + card.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>';
      case 'order':
        return '<ol class="ans-list ans-ol">' + card.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>';
      case 'match':
        return '<ul class="ans-list ans-pairs">' + card.pairs.map(p =>
          '<li><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></li>').join('') + '</ul>';
      default:
        return '<p>' + esc(card.a) + '</p>' + noteHTML(card);
    }
  }
  function frontText(card) {
    return card.type === 'def' && card.term ? card.term : card.q;
  }
  function unitOf(id) { return CC.ALL_UNITS.find(u => u.id === id); }
  function refLabel(card) {
    const src = CC.sourceOf(card);
    if (card.ref) return (src ? src.ref : 'Examen') + ' · pregunta ' + card.ref;
    return card.tag || CC.courseOfCard(card).source;
  }

  /* Filtro de origen (examen final / banco AAC) del curso activo.
     Sólo aparece en los cursos que reúnen más de un origen. */
  function sourceCount(courseId, srcId) {
    const ids = new Set(CC.unitsOf(courseId).filter(u => srcId === 'all' || u.src === srcId).map(u => u.id));
    return CC.ALL_CARDS.filter(c => ids.has(c.unit)).length;
  }
  function sourceSwitch() {
    const course = CC.course();
    if (!course.sources) return '';
    const cur = CC.sourceId();
    const opts = [{ id: 'all', short: 'Todo' }].concat(course.sources);
    return `<div class="src-switch" role="group" aria-label="Qué preguntas estudiar">
        ${opts.map(o => `<button class="src-opt ${o.id === cur ? 'on' : ''}" type="button" data-src="${o.id}"
            aria-pressed="${o.id === cur}">${esc(o.short)} <span class="src-n">${sourceCount(course.id, o.id)}</span></button>`).join('')}
      </div>`;
  }
  function bindSourceSwitch(root) {
    root.querySelectorAll('[data-src]').forEach(b => b.addEventListener('click', () => {
      if (b.dataset.src === CC.sourceId()) return;
      CC.fx.sfx.tap();
      CC.store.setSource(CC.courseId(), b.dataset.src);
      CC.app.reload();
    }));
  }
  /* Etiqueta corta del origen de una ficha, cuando se ven todos mezclados */
  function sourceTag(card) {
    const src = CC.sourceOf(card);
    if (!src || CC.sourceId() !== 'all') return '';
    return `<span class="src-tag ${src.id}">${esc(src.tag)}</span>`;
  }

  /* Pronunciación: sólo para cursos con idioma (el de inglés) */
  function sayText(card) {
    if (!CC.courseOfCard(card).lang) return '';
    return card.say || (card.type === 'def' && card.term) || '';
  }
  function sayButton(card) {
    const t = sayText(card);
    return t ? `<button class="say" type="button" data-say="${esc(t)}" aria-label="Escuchar: ${esc(t)}">🔊</button>` : '';
  }
  function speak(text, lang) {
    if (!('speechSynthesis' in window) || !text) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang || 'en-US';
    u.rate = 0.9;
    const voice = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace('_', '-').startsWith(u.lang.slice(0, 2)));
    if (voice) u.voice = voice;
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  }

  return { dayKey, addDays, daysBetween, shuffle, sample, pick, clamp, esc, humanDelay,
           answerText, answerHTML, frontText, unitOf, refLabel, pad, sayText, sayButton, speak,
           isTrueFalse, sourceCount, sourceSwitch, bindSourceSwitch, sourceTag };
})();
