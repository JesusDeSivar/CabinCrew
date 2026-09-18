/* Personajes: aviones y tripulantes dibujados en SVG, desbloqueables como recompensa. */
window.CC = window.CC || {};

CC.avatars = (function () {

  /* Ojos + mejillas + sonrisa reutilizables */
  function face(cx, cy, opt) {
    opt = opt || {};
    const s = opt.spread || 11, r = opt.eye || 5, blush = opt.blush !== false;
    const wink = opt.wink;
    return `
      <g class="av-face">
        <ellipse cx="${cx - s}" cy="${cy}" rx="${r}" ry="${r * 1.1}" fill="#1B2A44"/>
        ${wink
          ? `<path d="M${cx + s - r} ${cy} q${r} ${r * 0.9} ${r * 2} 0" stroke="#1B2A44" stroke-width="2.6" fill="none" stroke-linecap="round"/>`
          : `<ellipse cx="${cx + s}" cy="${cy}" rx="${r}" ry="${r * 1.1}" fill="#1B2A44"/>`}
        <circle cx="${cx - s + 1.7}" cy="${cy - 1.8}" r="${r * 0.34}" fill="#fff"/>
        ${wink ? '' : `<circle cx="${cx + s + 1.7}" cy="${cy - 1.8}" r="${r * 0.34}" fill="#fff"/>`}
        ${blush ? `<ellipse cx="${cx - s - 6}" cy="${cy + 7}" rx="4.6" ry="3" fill="#FF8FA3" opacity=".65"/>
                   <ellipse cx="${cx + s + 6}" cy="${cy + 7}" rx="4.6" ry="3" fill="#FF8FA3" opacity=".65"/>` : ''}
        <path d="M${cx - 6} ${cy + 9} q6 6 12 0" stroke="#1B2A44" stroke-width="2.6" fill="none" stroke-linecap="round"/>
      </g>`;
  }

  const ART = {
    /* ── Avión Avi ── */
    avi: () => `
      <g>
        <path d="M50 26 q9 0 9 12 v30 q0 10-9 10 t-9-10 V38 q0-12 9-12z" fill="#2FA8F5"/>
        <path d="M18 62 q-6 2-6 8 l30 3 v-14z" fill="#1E86D0"/>
        <path d="M82 62 q6 2 6 8 l-30 3 v-14z" fill="#1E86D0"/>
        <path d="M50 74 l-8 12 h16z" fill="#1E86D0"/>
        <ellipse cx="50" cy="46" rx="16" ry="14" fill="#EAF6FF"/>
        ${face(50, 45, { spread: 7, eye: 4.4 })}
        <circle cx="34" cy="80" r="3" fill="#FFB020"/><circle cx="66" cy="80" r="3" fill="#17C26A"/>
      </g>`,

    /* ── Lía, tripulante de cabina ── */
    lia: () => `
      <g>
        <path d="M28 88 q3-18 22-20 h0 q19 2 22 20z" fill="#123C6B"/>
        <path d="M42 68 h16 v10 q-8 6-16 0z" fill="#F0C9A8"/>
        <path d="M30 42 q0-20 20-20 t20 20 v10 q0 18-20 18T30 52z" fill="#F7D6B8"/>
        <path d="M28 40 q4-22 22-22 t22 22 q-6-8-22-8T28 40z" fill="#3A2418"/>
        <path d="M72 44 q8 4 6 14 q-6 2-8-6z" fill="#3A2418"/>
        ${face(50, 46, { spread: 9, eye: 4.2 })}
        <path d="M40 70 q10 8 20 0 l6 4 q-16 12-32 0z" fill="#E4443F"/>
        <rect x="44" y="76" width="12" height="7" rx="3.5" fill="#F5C33B"/>
      </g>`,

    /* ── Capitán Max ── */
    max: () => `
      <g>
        <path d="M26 88 q4-18 24-20 q20 2 24 20z" fill="#10305A"/>
        <path d="M32 44 q0-20 18-20 t18 20 v10 q0 18-18 18T32 54z" fill="#F3CBA6"/>
        <path d="M26 40 h48 q2-18-24-18T26 40z" fill="#0E2547"/>
        <path d="M24 40 h52 q4 0 4 5 H20q0-5 4-5z" fill="#1B3D6E"/>
        <circle cx="50" cy="31" r="4.5" fill="#F5C33B"/>
        ${face(50, 48, { spread: 9, eye: 4.2, blush: false })}
        <path d="M42 60 q8 5 16 0 q-4 6-8 6t-8-6z" fill="#9C8367"/>
        <rect x="30" y="78" width="40" height="5" rx="2.5" fill="#F5C33B"/>
      </g>`,

    /* ── Trolley Tito ── */
    tito: () => `
      <g>
        <rect x="26" y="22" width="48" height="56" rx="8" fill="#C8D6E6"/>
        <rect x="31" y="27" width="38" height="18" rx="5" fill="#EEF5FC"/>
        <rect x="31" y="50" width="38" height="12" rx="4" fill="#9FB4CC"/>
        ${face(50, 36, { spread: 8, eye: 4 })}
        <circle cx="35" cy="84" r="6" fill="#33445E"/><circle cx="65" cy="84" r="6" fill="#33445E"/>
        <rect x="44" y="64" width="12" height="4" rx="2" fill="#7A8CA6"/>
      </g>`,

    /* ── Chispa, el extintor ── */
    chispa: () => `
      <g>
        <rect x="32" y="30" width="36" height="52" rx="14" fill="#E23B3B"/>
        <rect x="36" y="46" width="28" height="18" rx="5" fill="#FFF0EC"/>
        <rect x="44" y="18" width="12" height="14" rx="4" fill="#4C5B72"/>
        <path d="M56 22 q14 0 14 10" stroke="#4C5B72" stroke-width="4" fill="none" stroke-linecap="round"/>
        ${face(50, 55, { spread: 7.5, eye: 4, blush: true })}
        <circle cx="50" cy="26" r="4" fill="#F5C33B"/>
      </g>`,

    /* ── Nimbo, el cumulonimbo ── */
    nimbo: () => `
      <g>
        <path d="M28 66 q-12 0-12-11 t12-11 q2-14 16-14 q9-9 19-1 q14-2 17 12 q10 2 10 12 t-12 13z" fill="#9FB6D2"/>
        <path d="M32 58 q-8 0-8-8 t9-8 q2-10 12-10 q7-7 15-1 q11-1 12 9 q8 1 8 9 t-9 9z" fill="#E7EEF7"/>
        ${face(50, 44, { spread: 9, eye: 4.2 })}
        <path d="M46 68 l12-2 l-7 11 l10-1 l-16 20 l5-15 l-9 1z" fill="#F5C33B"/>
      </g>`,

    /* ── Bali, el chaleco salvavidas ── */
    bali: () => `
      <g>
        <path d="M30 34 q20-10 40 0 l6 34 q-26 12-52 0z" fill="#F5A623"/>
        <path d="M44 32 h12 v34 h-12z" fill="#FFF6E6"/>
        <rect x="28" y="60" width="44" height="7" rx="3.5" fill="#E4443F"/>
        <circle cx="50" cy="24" r="11" fill="#FFD79A"/>
        ${face(50, 24, { spread: 5.5, eye: 3.2, blush: true })}
        <circle cx="34" cy="76" r="4" fill="#E4443F"/><circle cx="66" cy="76" r="4" fill="#E4443F"/>
      </g>`,

    /* ── Rosa, jefa de cabina ── */
    rosa: () => `
      <g>
        <path d="M28 88 q3-18 22-20 q19 2 22 20z" fill="#5B2A6E"/>
        <path d="M42 68 h16 v10 q-8 6-16 0z" fill="#C88A63"/>
        <path d="M31 44 q0-20 19-20 t19 20 v9 q0 18-19 18T31 53z" fill="#D69A72"/>
        <path d="M29 44 q2-24 21-24 t21 24 q2-14-21-16T29 44z" fill="#20160F"/>
        <circle cx="30" cy="52" r="6" fill="#20160F"/><circle cx="70" cy="52" r="6" fill="#20160F"/>
        ${face(50, 47, { spread: 9, eye: 4.2 })}
        <path d="M40 70 q10 8 20 0 l6 4 q-16 12-32 0z" fill="#8E44AD"/>
        <path d="M50 78 l3 6-3 6-3-6z" fill="#F5C33B"/>
      </g>`,

    /* ── Kit, el botiquín ── */
    kit: () => `
      <g>
        <rect x="24" y="34" width="52" height="46" rx="10" fill="#F4F8FC"/>
        <rect x="24" y="34" width="52" height="12" rx="6" fill="#D9E4F0"/>
        <rect x="42" y="24" width="16" height="10" rx="4" fill="#8AA0BC"/>
        <rect x="45" y="54" width="10" height="26" rx="3" fill="#E24B4B"/>
        <rect x="37" y="62" width="26" height="10" rx="3" fill="#E24B4B"/>
        ${face(50, 46, { spread: 10, eye: 3.6, blush: true })}
      </g>`,

    /* ── Jet, el reactor veloz ── */
    jet: () => `
      <g>
        <path d="M22 58 q10-8 28-8 h14 q12 0 16 10 q-4 10-16 10 H50 q-18 0-28-8z" fill="#3C4C66"/>
        <path d="M44 50 l10-20 h6 l-4 20z" fill="#2B3950"/>
        <path d="M46 68 l6 14 h6 l-4-14z" fill="#2B3950"/>
        <ellipse cx="66" cy="60" rx="14" ry="10" fill="#EAF2FB"/>
        ${face(68, 59, { spread: 6, eye: 3.8, wink: true })}
        <path d="M22 54 q-12 2-16 6 q12 2 16 4z" fill="#FF8A3D"/>
        <path d="M18 60 q-14 2-18 4 q10 2 18 2z" fill="#FFC04D"/>
      </g>`,

    /* ── Nube Cumulita (compañera de racha) ── */
    luna: () => `
      <g>
        <circle cx="50" cy="52" r="26" fill="#2B3E66"/>
        <path d="M50 26 a26 26 0 1 0 22 40 a22 22 0 0 1-22-40z" fill="#F6D976"/>
        ${face(44, 52, { spread: 8, eye: 4, blush: true })}
        <circle cx="76" cy="26" r="3" fill="#F6D976"/><circle cx="24" cy="24" r="2" fill="#F6D976"/>
      </g>`
  };

  const LIST = [
    { id: 'avi',    name: 'Avi',        role: 'Tu avión de cabecera',      how: 'Disponible desde el inicio', check: () => true },
    { id: 'lia',    name: 'Lía',        role: 'Tripulante de cabina',      how: 'Disponible desde el inicio', check: () => true },
    { id: 'max',    name: 'Capitán Max', role: 'Comandante',               how: 'Alcanza el nivel 3',
      check: s => CC.store.level() >= 3 },
    { id: 'tito',   name: 'Tito',       role: 'Carro de servicio',         how: 'Completa 6 lecciones',
      check: s => Object.values(s.lessons).filter(l => l.done).length >= 6 },
    { id: 'nimbo',  name: 'Nimbo',      role: 'Cumulonimbo gruñón',        how: 'Completa la unidad de meteorología',
      check: () => CC.store.unitProgress('meteo').pct >= 1 },
    { id: 'chispa', name: 'Chispa',     role: 'Extintor valiente',         how: 'Completa la unidad de emergencias',
      check: () => CC.store.unitProgress('emer').pct >= 1 },
    { id: 'bali',   name: 'Bali',       role: 'Chaleco salvavidas',        how: 'Completa la unidad de supervivencia',
      check: () => CC.store.unitProgress('surv').pct >= 1 },
    { id: 'kit',    name: 'Kit',        role: 'Botiquín de a bordo',       how: 'Completa la unidad de primeros auxilios',
      check: () => CC.store.unitProgress('pa').pct >= 1 },
    { id: 'rosa',   name: 'Rosa',       role: 'Jefa de cabina',            how: 'Mantén una racha de 7 días',
      check: s => s.streak.best >= 7 },
    { id: 'jet',    name: 'Jet',        role: 'Reactor veloz',             how: 'Aprueba un simulacro de examen',
      check: s => (s.stats.examBest || 0) >= 70 },
    { id: 'luna',   name: 'Luna',       role: 'Vuelo nocturno',            how: 'Haz 100 repasos Anki',
      check: s => (s.stats.reviews || 0) >= 100 }
  ];

  function svg(id, size, cls) {
    const art = ART[id] || ART.avi;
    return `<svg class="avatar ${cls || ''}" viewBox="0 0 100 100" width="${size || 64}" height="${size || 64}"
              role="img" aria-label="Personaje ${id}">${art()}</svg>`;
  }

  function byId(id) { return LIST.find(a => a.id === id) || LIST[0]; }

  /* Devuelve los personajes recién desbloqueados */
  function refresh() {
    const s = CC.store.get();
    const gained = [];
    LIST.forEach(a => {
      if (!s.avatars.unlocked.includes(a.id) && a.check(s)) {
        s.avatars.unlocked.push(a.id);
        gained.push(a);
      }
    });
    if (gained.length) CC.store.save();
    return gained;
  }

  return { svg, LIST, byId, refresh, ART };
})();
