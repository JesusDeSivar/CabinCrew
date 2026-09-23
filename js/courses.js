/* Cursos: el examen TCP y la extensión de inglés técnico (ESL).
   CC.UNITS y CC.CARDS devuelven sólo los del curso activo, así la ruta, el
   repaso, las fichas y el simulacro se ciñen a él. El total está en
   CC.ALL_UNITS y CC.ALL_CARDS. */
window.CC = window.CC || {};

CC.COURSES = [
  { id: 'tcp', name: 'Examen TCP', short: 'Examen TCP', icon: '✈️',
    blurb: 'Examen final de tripulante de cabina', source: 'Examen' },
  { id: 'esl', name: 'English for Aviation', short: 'Inglés técnico', icon: '🇬🇧',
    blurb: 'Inglés técnico de aviación para hispanohablantes', source: 'English for Aviation',
    lang: 'en-US', reversePrompt: '¿Cómo se dice en inglés?' }
];

CC.ALL_UNITS = CC.UNITS.map(u => Object.assign({ course: 'tcp' }, u)).concat(CC.ESL.UNITS);
CC.ALL_CARDS = CC.CARDS.concat(CC.ESL.CARDS);
CC.CARD_BY_ID = Object.fromEntries(CC.ALL_CARDS.map(c => [c.id, c]));

CC.courseId = function () {
  const id = CC.store && CC.store.get().settings.course;
  return CC.COURSES.some(c => c.id === id) ? id : CC.COURSES[0].id;
};
CC.course = function (id) {
  id = id || CC.courseId();
  return CC.COURSES.find(c => c.id === id);
};
CC.unitsOf = courseId => CC.ALL_UNITS.filter(u => u.course === courseId);
CC.courseOfCard = function (card) {
  const u = CC.ALL_UNITS.find(x => x.id === card.unit);
  return CC.course(u ? u.course : null);
};

Object.defineProperty(CC, 'UNITS', {
  configurable: true,
  get() { return CC.unitsOf(CC.courseId()); }
});
Object.defineProperty(CC, 'CARDS', {
  configurable: true,
  get() {
    const ids = new Set(CC.UNITS.map(u => u.id));
    return CC.ALL_CARDS.filter(c => ids.has(c.unit));
  }
});
