/* Cursos: el examen TCP y la extensión de inglés técnico (ESL).
   CC.UNITS y CC.CARDS devuelven sólo los del curso activo, así la ruta, el
   repaso, las fichas y el simulacro se ciñen a él. El total está en
   CC.ALL_UNITS y CC.ALL_CARDS.
   Un curso puede reunir varios orígenes (el TCP junta el examen final y el
   banco de la AAC): cada unidad lleva su `src` y el filtro de origen del
   curso decide cuáles entran en CC.UNITS. */
window.CC = window.CC || {};

CC.COURSES = [
  { id: 'tcp', name: 'Examen TCP', short: 'Examen TCP', icon: '✈️',
    blurb: 'Examen final de tripulante de cabina', source: 'Examen',
    sources: [
      { id: 'final', name: 'Examen final', short: 'Examen final', tag: 'Final', ref: 'Examen' },
      { id: 'aac',   name: 'Banco AAC',    short: 'Banco AAC',    tag: 'AAC',   ref: 'Banco AAC',
        blurb: 'Examen de Auxiliar de Cabina de la AAC de El Salvador' }
    ] },
  { id: 'esl', name: 'English for Aviation', short: 'Inglés técnico', icon: '🇬🇧',
    blurb: 'Inglés técnico de aviación para hispanohablantes', source: 'English for Aviation',
    lang: 'en-US', reversePrompt: '¿Cómo se dice en inglés?' }
];

CC.ALL_UNITS = CC.UNITS.map(u => Object.assign({ course: 'tcp', src: 'final' }, u))
  .concat(CC.AAC.UNITS, CC.ESL.UNITS);
CC.ALL_CARDS = CC.CARDS.concat(CC.AAC.CARDS, CC.ESL.CARDS);
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

/* Orígenes: 'all' o el id de uno de los `sources` del curso */
CC.sourceId = function (courseId) {
  const course = CC.course(courseId);
  const map = (CC.store && CC.store.get().settings.sources) || {};
  const id = map[course.id];
  return course.sources && course.sources.some(s => s.id === id) ? id : 'all';
};
CC.sourceOf = function (card) {
  const u = CC.ALL_UNITS.find(x => x.id === card.unit);
  const course = CC.course(u ? u.course : null);
  return (course.sources || []).find(s => s.id === (u && u.src)) || null;
};

Object.defineProperty(CC, 'UNITS', {
  configurable: true,
  get() {
    const src = CC.sourceId();
    return CC.unitsOf(CC.courseId()).filter(u => src === 'all' || u.src === src);
  }
});
Object.defineProperty(CC, 'CARDS', {
  configurable: true,
  get() {
    const ids = new Set(CC.UNITS.map(u => u.id));
    return CC.ALL_CARDS.filter(c => ids.has(c.unit));
  }
});
