/* Logros: se comprueban tras cada sesión. */
window.CC = window.CC || {};

CC.achievements = (function () {
  const srcDone = (course, src) =>
    CC.unitsOf(course).filter(u => u.src === src).every(u => CC.store.unitProgress(u.id).pct >= 1);

  const LIST = [
    { id: 'first',    icon: '🛫', name: 'Primer despegue',   desc: 'Completa tu primera lección',
      check: s => Object.values(s.lessons).filter(l => l.done).length >= 1 },
    { id: 'ten',      icon: '🗺️', name: 'Plan de vuelo',      desc: 'Completa 10 lecciones',
      check: s => Object.values(s.lessons).filter(l => l.done).length >= 10 },
    { id: 'allunits', icon: '🏆', name: 'Manual completo',    desc: 'Termina todas las unidades del examen final',
      check: () => srcDone('tcp', 'final') },
    { id: 'aacbank',  icon: '🏛️', name: 'Banco AAC dominado', desc: 'Termina todas las unidades del banco AAC',
      check: () => srcDone('tcp', 'aac') },
    { id: 'bilingual', icon: '🇬🇧', name: 'Tripulación bilingüe', desc: 'Termina el curso básico de English for Aviation',
      check: () => srcDone('esl', 'base') },
    { id: 'cp1',      icon: '📗', name: 'Libro 1 superado',    desc: 'Termina las 15 unidades del libro 1 de Career Paths',
      check: () => srcDone('esl', 'cp1') },
    { id: 'cp2',      icon: '📘', name: 'Libro 2 superado',    desc: 'Termina las 15 unidades del libro 2 de Career Paths',
      check: () => srcDone('esl', 'cp2') },
    { id: 'cp3',      icon: '📙', name: 'Libro 3 superado',    desc: 'Termina las 15 unidades del libro 3 de Career Paths',
      check: () => srcDone('esl', 'cp3') },
    { id: 'streak3',  icon: '🔥', name: 'Racha de 3 días',    desc: 'Estudia 3 días seguidos',
      check: s => s.streak.best >= 3 },
    { id: 'streak7',  icon: '🔥', name: 'Semana perfecta',    desc: 'Estudia 7 días seguidos',
      check: s => s.streak.best >= 7 },
    { id: 'streak30', icon: '💎', name: 'Tripulante de hierro', desc: 'Estudia 30 días seguidos',
      check: s => s.streak.best >= 30 },
    { id: 'correct100', icon: '🎯', name: 'Puntería',         desc: '100 respuestas correctas',
      check: s => s.stats.correct >= 100 },
    { id: 'anki50',   icon: '🧠', name: 'Memoria de a bordo',  desc: '50 repasos Anki',
      check: s => s.stats.reviews >= 50 },
    { id: 'exampass', icon: '📋', name: 'Examen aprobado',     desc: 'Saca 70% o más en un simulacro',
      check: s => (s.stats.examBest || 0) >= 70 },
    { id: 'examperf', icon: '🌟', name: 'Simulacro perfecto',  desc: 'Saca 100% en un simulacro',
      check: s => (s.stats.examBest || 0) >= 100 },
    { id: 'collector', icon: '🎒', name: 'Coleccionista',      desc: 'Desbloquea 6 personajes',
      check: s => s.avatars.unlocked.length >= 6 },
    { id: 'mature20', icon: '🌱', name: 'Conocimiento firme',  desc: '20 fichas en memoria a largo plazo',
      check: () => CC.store.srsCounts().mature >= 20 }
  ];

  function refresh() {
    const s = CC.store.get();
    const gained = [];
    LIST.forEach(a => {
      if (!s.achievements[a.id] && a.check(s)) {
        s.achievements[a.id] = new Date().toISOString();
        gained.push(a);
      }
    });
    if (gained.length) CC.store.save();
    return gained;
  }

  return { LIST, refresh };
})();
