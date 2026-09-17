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

  /* Texto de la cara posterior de una ficha, según su tipo */
  function answerText(card) {
    switch (card.type) {
      case 'list': return card.items.map(i => '• ' + i).join('\n');
      case 'order': return card.steps.map((s, i) => (i + 1) + '. ' + s).join('\n');
      case 'match': return card.pairs.map(p => p[0] + ' → ' + p[1]).join('\n');
      default: return card.a;
    }
  }
  function answerHTML(card) {
    switch (card.type) {
      case 'list':
        return '<ul class="ans-list">' + card.items.map(i => '<li>' + esc(i) + '</li>').join('') + '</ul>';
      case 'order':
        return '<ol class="ans-list ans-ol">' + card.steps.map(s => '<li>' + esc(s) + '</li>').join('') + '</ol>';
      case 'match':
        return '<ul class="ans-list ans-pairs">' + card.pairs.map(p =>
          '<li><b>' + esc(p[0]) + '</b><span>' + esc(p[1]) + '</span></li>').join('') + '</ul>';
      default:
        return '<p>' + esc(card.a) + '</p>' + (card.note ? '<p class="ans-note">' + esc(card.note) + '</p>' : '');
    }
  }
  function frontText(card) {
    return card.type === 'def' && card.term ? card.term : card.q;
  }
  function unitOf(id) { return CC.UNITS.find(u => u.id === id); }
  function refLabel(card) {
    if (card.ref) return 'Examen · pregunta ' + card.ref;
    return card.tag || 'Examen';
  }

  return { dayKey, addDays, daysBetween, shuffle, sample, pick, clamp, esc, humanDelay,
           answerText, answerHTML, frontText, unitOf, refLabel, pad };
})();
