/* Estado del jugador: XP, niveles, racha, corazones, progreso y mazo SRS. */
window.CC = window.CC || {};

CC.store = (function () {
  const KEY = 'cabincrew.state.v1';
  const HEART_MAX = 5;
  const HEART_REFILL_MS = 10 * 60 * 1000;
  const U = () => CC.util;

  const RANKS = [
    { min: 1,  name: 'Cadete' },
    { min: 3,  name: 'Tripulante junior' },
    { min: 5,  name: 'TCP certificado' },
    { min: 7,  name: 'Sobrecargo' },
    { min: 9,  name: 'Jefe de cabina' },
    { min: 12, name: 'Instructor de cabina' }
  ];

  function defaults() {
    return {
      v: 1,
      profile: { name: '', avatar: 'avi', createdAt: Date.now() },
      xp: 0,
      streak: { current: 0, best: 0, last: '' },
      daily: { day: '', xp: 0, lessons: 0, reviews: 0, goal: 50 },
      history: {},
      hearts: { count: HEART_MAX, ts: Date.now() },
      lessons: {},          // lessonId -> { stars, best, done }
      srs: {},              // cardId -> tarjeta SRS
      stats: { answered: 0, correct: 0, reviews: 0, exams: 0, examBest: 0, byUnit: {} },
      achievements: {},
      avatars: { unlocked: ['avi', 'lia'] },
      settings: { sound: true, haptics: true, newPerDay: 15, maxReviews: 60 }
    };
  }

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return defaults();
      const parsed = JSON.parse(raw);
      return Object.assign(defaults(), parsed, {
        profile: Object.assign(defaults().profile, parsed.profile),
        daily: Object.assign(defaults().daily, parsed.daily),
        stats: Object.assign(defaults().stats, parsed.stats),
        settings: Object.assign(defaults().settings, parsed.settings),
        avatars: Object.assign(defaults().avatars, parsed.avatars),
        hearts: Object.assign(defaults().hearts, parsed.hearts)
      });
    } catch (e) { return defaults(); }
  }

  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* modo privado */ }
  }

  function get() { return state; }

  /* ── Lecciones ─────────────────────────────────────────── */
  const LESSON_SIZE = 4;
  const LESSONS = (function () {
    const out = [];
    CC.UNITS.forEach(u => {
      const cards = CC.CARDS.filter(c => c.unit === u.id);
      for (let i = 0; i < cards.length; i += LESSON_SIZE) {
        const chunk = cards.slice(i, i + LESSON_SIZE);
        out.push({ id: u.id + '-' + (out.filter(l => l.unit === u.id).length + 1),
                   unit: u.id, index: out.filter(l => l.unit === u.id).length,
                   cards: chunk.map(c => c.id) });
      }
    });
    return out;
  })();
  const lessonsOfUnit = uid => LESSONS.filter(l => l.unit === uid);
  const lessonById = id => LESSONS.find(l => l.id === id);

  function lessonState(id) {
    const done = state.lessons[id];
    if (done && done.done) return 'done';
    const l = lessonById(id);
    if (!l) return 'locked';
    const unitLessons = lessonsOfUnit(l.unit);
    const uIndex = CC.UNITS.findIndex(u => u.id === l.unit);
    if (l.index === 0) {
      if (uIndex === 0) return 'open';
      const prevUnit = CC.UNITS[uIndex - 1].id;
      const prevDone = lessonsOfUnit(prevUnit).every(x => state.lessons[x.id] && state.lessons[x.id].done);
      // la unidad anterior no bloquea del todo: basta con la mitad hecha
      const half = lessonsOfUnit(prevUnit).filter(x => state.lessons[x.id] && state.lessons[x.id].done).length;
      return (prevDone || half >= Math.ceil(lessonsOfUnit(prevUnit).length / 2)) ? 'open' : 'locked';
    }
    const prev = unitLessons[l.index - 1];
    return (state.lessons[prev.id] && state.lessons[prev.id].done) ? 'open' : 'locked';
  }

  function unitProgress(uid) {
    const ls = lessonsOfUnit(uid);
    const done = ls.filter(l => state.lessons[l.id] && state.lessons[l.id].done).length;
    return { done, total: ls.length, pct: ls.length ? done / ls.length : 0 };
  }

  function nextLesson() {
    for (const l of LESSONS) if (lessonState(l.id) === 'open') return l;
    return null;
  }

  /* ── Niveles ───────────────────────────────────────────── */
  function xpForLevel(l) { return 50 * l * l + 50 * l; }   // XP acumulado para alcanzar el nivel l+1
  function level() {
    let l = 1;
    while (state.xp >= xpForLevel(l)) l++;
    return l;
  }
  function levelInfo() {
    const l = level();
    const floor = l === 1 ? 0 : xpForLevel(l - 1);
    const ceil = xpForLevel(l);
    return { level: l, floor, ceil, into: state.xp - floor, need: ceil - floor,
             pct: (state.xp - floor) / (ceil - floor), rank: rankName(l) };
  }
  function rankName(l) {
    let r = RANKS[0].name;
    RANKS.forEach(x => { if (l >= x.min) r = x.name; });
    return r;
  }

  /* ── Racha y día ───────────────────────────────────────── */
  function touchDay() {
    const today = U().dayKey();
    if (state.daily.day !== today) {
      state.daily = { day: today, xp: 0, lessons: 0, reviews: 0, goal: state.daily.goal || 50 };
      save();
    }
    return today;
  }

  function registerActivity() {
    const today = touchDay();
    const last = state.streak.last;
    if (last === today) return;
    if (!last) state.streak.current = 1;
    else {
      const diff = U().daysBetween(last, today);
      state.streak.current = diff === 1 ? state.streak.current + 1 : 1;
    }
    state.streak.last = today;
    state.streak.best = Math.max(state.streak.best, state.streak.current);
    save();
  }

  function addXP(n) {
    touchDay();
    state.xp += n;
    state.daily.xp += n;
    const today = state.daily.day;
    state.history[today] = (state.history[today] || 0) + n;
    registerActivity();
    save();
    return state.xp;
  }

  function weekHistory() {
    const today = U().dayKey();
    const out = [];
    for (let i = 6; i >= 0; i--) {
      const k = U().addDays(today, -i);
      out.push({ key: k, xp: state.history[k] || 0, today: i === 0 });
    }
    return out;
  }

  /* ── Corazones ─────────────────────────────────────────── */
  function hearts() {
    const h = state.hearts;
    if (h.count < HEART_MAX) {
      const gained = Math.floor((Date.now() - h.ts) / HEART_REFILL_MS);
      if (gained > 0) {
        h.count = Math.min(HEART_MAX, h.count + gained);
        h.ts = h.count >= HEART_MAX ? Date.now() : h.ts + gained * HEART_REFILL_MS;
        save();
      }
    }
    return h.count;
  }
  function loseHeart() {
    hearts();
    if (state.hearts.count === HEART_MAX) state.hearts.ts = Date.now();
    state.hearts.count = Math.max(0, state.hearts.count - 1);
    save();
    return state.hearts.count;
  }
  function gainHeart(n) {
    hearts();
    state.hearts.count = Math.min(HEART_MAX, state.hearts.count + (n || 1));
    save();
    return state.hearts.count;
  }
  function heartTimer() {
    if (state.hearts.count >= HEART_MAX) return 0;
    return Math.max(0, HEART_REFILL_MS - (Date.now() - state.hearts.ts));
  }

  /* ── Mazo SRS ──────────────────────────────────────────── */
  function srsCard(id) { return state.srs[id] || CC.srs.fresh(id); }

  function gradeCard(id, grade) {
    const before = srsCard(id);
    const after = CC.srs.answer(before, grade);
    state.srs[id] = after;
    state.stats.reviews += 1;
    save();
    return after;
  }

  function introduce(id) {
    if (!state.srs[id]) {
      const c = CC.srs.fresh(id);
      c.state = 'learning'; c.step = 0; c.due = Date.now() + CC.srs.LEARN_STEPS[0] * 60000;
      state.srs[id] = c;
      save();
    }
  }

  function dueCards(now) {
    now = now || Date.now();
    return CC.CARDS
      .filter(c => state.srs[c.id] && state.srs[c.id].due <= now && state.srs[c.id].state !== 'new')
      .sort((a, b) => state.srs[a.id].due - state.srs[b.id].due);
  }
  function newCards() {
    return CC.CARDS.filter(c => !state.srs[c.id]);
  }
  function reviewQueue() {
    const due = dueCards().slice(0, state.settings.maxReviews);
    const fresh = newCards().slice(0, state.settings.newPerDay);
    return { due, fresh, all: due.concat(fresh) };
  }
  function srsCounts() {
    const c = { new: 0, learning: 0, young: 0, mature: 0 };
    CC.CARDS.forEach(card => { c[CC.srs.bucket(state.srs[card.id])]++; });
    return c;
  }

  /* ── Resultados ────────────────────────────────────────── */
  function recordAnswer(unit, ok) {
    state.stats.answered += 1;
    if (ok) state.stats.correct += 1;
    const u = state.stats.byUnit[unit] || { answered: 0, correct: 0 };
    u.answered += 1; if (ok) u.correct += 1;
    state.stats.byUnit[unit] = u;
    save();
  }

  function completeLesson(id, stars, xp) {
    const prev = state.lessons[id] || { stars: 0, done: false, plays: 0 };
    state.lessons[id] = { done: true, stars: Math.max(prev.stars || 0, stars), plays: (prev.plays || 0) + 1 };
    state.daily.lessons += 1;
    lessonById(id).cards.forEach(introduce);
    addXP(xp);
    save();
  }

  function recordExam(score, total) {
    state.stats.exams += 1;
    const pct = Math.round((score / total) * 100);
    state.stats.examBest = Math.max(state.stats.examBest || 0, pct);
    save();
    return pct;
  }

  function accuracy() {
    return state.stats.answered ? state.stats.correct / state.stats.answered : 0;
  }

  function reset() { state = defaults(); save(); }

  function importState(obj) {
    if (!obj || typeof obj !== 'object') throw new Error('Archivo no válido');
    state = Object.assign(defaults(), obj);
    save();
  }

  return {
    get, save, reset, importState, defaults,
    LESSONS, LESSON_SIZE, lessonsOfUnit, lessonById, lessonState, unitProgress, nextLesson,
    level, levelInfo, xpForLevel, rankName,
    touchDay, registerActivity, addXP, weekHistory,
    hearts, loseHeart, gainHeart, heartTimer, HEART_MAX, HEART_REFILL_MS,
    srsCard, gradeCard, introduce, dueCards, newCards, reviewQueue, srsCounts,
    recordAnswer, completeLesson, recordExam, accuracy
  };
})();
