/* Repetición espaciada estilo Anki (SM-2 con pasos de aprendizaje).
   Calidades: 0 = Otra vez · 1 = Difícil · 2 = Bien · 3 = Fácil */
window.CC = window.CC || {};

CC.srs = (function () {
  const MIN = 60000, DAY = 86400000;
  const LEARN_STEPS = [1, 10];       // minutos
  const RELEARN_STEPS = [10];        // minutos
  const GRADUATE_DAYS = 1;
  const EASY_DAYS = 4;

  function fresh(id) {
    return { id, state: 'new', step: 0, ef: 2.5, ivl: 0, reps: 0, lapses: 0, due: 0, seen: 0 };
  }

  function answer(c, grade, now) {
    now = now || Date.now();
    c = Object.assign({}, c);
    c.reps += 1;
    c.seen = now;
    c.lastGrade = grade;

    if (c.state === 'new' || c.state === 'learning') {
      c.state = 'learning';
      if (grade === 0) { c.step = 0; c.due = now + LEARN_STEPS[0] * MIN; }
      else if (grade === 1) { c.due = now + LEARN_STEPS[Math.min(c.step, LEARN_STEPS.length - 1)] * MIN; }
      else if (grade === 2) {
        c.step += 1;
        if (c.step >= LEARN_STEPS.length) { c.state = 'review'; c.ivl = GRADUATE_DAYS; c.due = now + c.ivl * DAY; }
        else { c.due = now + LEARN_STEPS[c.step] * MIN; }
      } else { c.state = 'review'; c.ivl = EASY_DAYS; c.due = now + c.ivl * DAY; }
      return c;
    }

    if (c.state === 'relearning') {
      if (grade === 0) { c.step = 0; c.due = now + RELEARN_STEPS[0] * MIN; }
      else if (grade === 1) { c.due = now + RELEARN_STEPS[0] * MIN; }
      else { c.state = 'review'; c.ivl = Math.max(1, Math.round(c.ivl || 1)); c.due = now + c.ivl * DAY; }
      return c;
    }

    // review
    if (grade === 0) {
      c.lapses += 1;
      c.ef = CC.util.clamp(c.ef - 0.2, 1.3, 3.0);
      c.ivl = Math.max(1, Math.round(c.ivl * 0.5));
      c.state = 'relearning'; c.step = 0;
      c.due = now + RELEARN_STEPS[0] * MIN;
      return c;
    }
    if (grade === 1) { c.ef = CC.util.clamp(c.ef - 0.15, 1.3, 3.0); c.ivl = Math.max(1, Math.round(c.ivl * 1.2)); }
    else if (grade === 2) { c.ivl = Math.max(1, Math.round(c.ivl * c.ef)); }
    else { c.ef = CC.util.clamp(c.ef + 0.15, 1.3, 3.0); c.ivl = Math.max(1, Math.round(c.ivl * c.ef * 1.3)); }
    c.ivl = Math.min(c.ivl, 365);
    c.due = now + c.ivl * DAY;
    return c;
  }

  /* Vista previa de cuándo volvería a salir la ficha con cada calidad */
  function preview(c, now) {
    now = now || Date.now();
    return [0, 1, 2, 3].map(g => CC.util.humanDelay(answer(c, g, now).due - now));
  }

  function bucket(c) {
    if (!c || c.state === 'new') return 'new';
    if (c.state === 'learning' || c.state === 'relearning') return 'learning';
    return c.ivl >= 21 ? 'mature' : 'young';
  }

  return { fresh, answer, preview, bucket, LEARN_STEPS };
})();
