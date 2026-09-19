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
    /* ── Avi, el widebody regordete ── */
    avi: () => `
      <g>
        <path d="M50 12 q9 5 10 19 q-10-3-20 0 q1-14 10-19z" fill="#1A6FAE"/>
        <path d="M30 52 q-26 4-27 15 q-1 7 7 6 l22-6z" fill="#1E86D0"/>
        <path d="M70 52 q26 4 27 15 q1 7-7 6 l-22-6z" fill="#1E86D0"/>
        <rect x="6" y="66" width="17" height="12" rx="6" fill="#15679E"/>
        <rect x="77" y="66" width="17" height="12" rx="6" fill="#15679E"/>
        <ellipse cx="14.5" cy="72" rx="4" ry="4.6" fill="#0E4E7B"/>
        <ellipse cx="85.5" cy="72" rx="4" ry="4.6" fill="#0E4E7B"/>
        <path d="M50 26 q22 0 22 24 v14 q0 22-22 28 q-22-6-22-28V50 q0-24 22-24z" fill="#2FA8F5"/>
        <ellipse cx="50" cy="49" rx="17.5" ry="14" fill="#EAF6FF"/>
        ${face(50, 48, { spread: 7.4, eye: 5.2 })}
        <ellipse cx="50" cy="84" rx="11" ry="8" fill="#DCEBF8"/>
        <circle cx="95" cy="73" r="2.8" fill="#FF4D5E"/><circle cx="5" cy="73" r="2.8" fill="#17C26A"/>
      </g>`,

    /* ── Lía, jefa de vuelo ── */
    lia: () => `
      <g>
        <path d="M27 88 q3-19 23-21 q20 2 23 21z" fill="#123C6B"/>
        <path d="M40 66 h20 v11 q-10 7-20 0z" fill="#E8B88F"/>
        <path d="M40 77 q10 8 20 0 l5 3 -15 11 -15-11z" fill="#E4443F"/>
        <path d="M33 47 q0-20 17-20 t17 20 v8 q0 18-17 18T33 55z" fill="#F7D6B8"/>
        <path d="M31 48 q1-24 19-24 t19 24 q2-12-19-14 T31 48z" fill="#5A3A26"/>
        <path d="M69 49 q9 5 7 16 q-7 2-9-7z" fill="#5A3A26"/>
        <path d="M31 31 q19-12 38 0 l-2 5 q-17-7-34 0z" fill="#16355E"/>
        <path d="M33 25 q17-9 34 0 q1 6-17 6 t-17-6z" fill="#0E2547"/>
        <path d="M43 26 q7-3 14 0 q-7 2-14 0z" fill="#F5C33B"/>
        ${face(50, 49, { spread: 7, eye: 4.8 })}
        <rect x="29" y="83" width="10" height="2.8" rx="1.4" fill="#F5C33B"/>
        <rect x="29" y="87.5" width="10" height="2.8" rx="1.4" fill="#F5C33B"/>
        <rect x="61" y="83" width="10" height="2.8" rx="1.4" fill="#F5C33B"/>
        <rect x="61" y="87.5" width="10" height="2.8" rx="1.4" fill="#F5C33B"/>
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

    /* ── Jet, el reactor delgado ── */
    jet: () => `
      <g>
        <path d="M50 8 q5 8 5 16 l-10 0 q0-8 5-16z" fill="#2A3B55"/>
        <path d="M41 46 l-35 30 q-2 2 1 3 l10-1 l26-20z" fill="#42597A"/>
        <path d="M59 46 l35 30 q2 2-1 3 l-10-1 l-26-20z" fill="#42597A"/>
        <path d="M8 77 l-4 10 q-1 3 2 3 l5-2 l1-11z" fill="#31435F"/>
        <path d="M92 77 l4 10 q1 3-2 3 l-5-2 l-1-11z" fill="#31435F"/>
        <path d="M50 14 q10 0 10 20 v24 q0 18-10 26 q-10-8-10-26V34 q0-20 10-20z" fill="#55708F"/>
        <path d="M40 62 h20 v3.5 h-20z" fill="#FF8A3D" opacity=".9"/>
        <path d="M38 37 q12-7 24 0 q1 8-12 8 t-12-8z" fill="#16263D"/>
        <rect x="37" y="34.5" width="26" height="3.4" rx="1.7" fill="#0E1826"/>
        <circle cx="43.5" cy="39" r="1.8" fill="#7FD4FF" opacity=".85"/>
        <path d="M45 51 q5 3.5 10-1" stroke="#16263D" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        <path d="M45 82 q5 4 10 0 l-2.5 10 q-2.5 3.5-5 0z" fill="#FF8A3D"/>
        <path d="M47 85 q3 2.5 6 0 l-1.5 6 q-1.5 2-3 0z" fill="#FFD166"/>
        <circle cx="90" cy="84" r="2.5" fill="#FF4D5E"/><circle cx="10" cy="84" r="2.5" fill="#17C26A"/>
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
    { id: 'avi',    name: 'Avi',        role: 'Widebody de cabecera',      how: 'Disponible desde el inicio', check: () => true },
    { id: 'lia',    name: 'Lía',        role: 'Jefa de vuelo',             how: 'Disponible desde el inicio', check: () => true },
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
    { id: 'rosa',   name: 'Rosa',       role: 'Instructora de cabina',     how: 'Mantén una racha de 7 días',
      check: s => s.streak.best >= 7 },
    { id: 'jet',    name: 'Jet',        role: 'Reactor delgado y veloz',   how: 'Aprueba un simulacro de examen',
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
