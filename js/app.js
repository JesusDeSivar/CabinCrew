/* Enrutador, HUD y arranque de la aplicación. */
window.CC = window.CC || {};

CC.app = (function () {
  const views = {};
  let current = { name: '', arg: null };

  function register(name, view) { views[name] = view; }

  const TABS = [
    { id: 'home',    label: 'Ruta',    icon: '🗺️' },
    { id: 'review',  label: 'Repaso',  icon: '🧠' },
    { id: 'browse',  label: 'Fichas',  icon: '📖' },
    { id: 'exam',    label: 'Examen',  icon: '📋' },
    { id: 'profile', label: 'Perfil',  icon: '🎖️' }
  ];

  function go(name, arg) {
    const v = views[name];
    if (!v) return;
    current = { name, arg };
    const root = document.getElementById('screen');
    root.scrollTop = 0;
    document.getElementById('app').scrollTop = 0;
    window.scrollTo(0, 0);
    root.innerHTML = '';
    document.body.dataset.view = name;
    const chrome = v.chrome !== false;
    document.getElementById('hud').hidden = !chrome;
    document.getElementById('tabs').hidden = !chrome;
    if (chrome) renderHUD();
    v.render(root, arg);
    renderTabs();
  }

  function reload() { go(current.name, current.arg); }

  function renderHUD() {
    const s = CC.store.get();
    const li = CC.store.levelInfo();
    const hearts = CC.store.hearts();
    const due = CC.store.dueCards().length;
    const el = document.getElementById('hud');
    el.innerHTML = `
      <div class="hud-row">
        <button class="hud-chip streak" type="button" data-goto="profile" aria-label="Racha de ${s.streak.current} días">
          <span class="ic">🔥</span><b>${s.streak.current}</b>
        </button>
        <button class="hud-chip lvl" type="button" data-goto="profile" aria-label="Nivel ${li.level}">
          <span class="lvl-badge">${li.level}</span>
          <span class="lvl-bar"><i style="width:${Math.round(li.pct * 100)}%"></i></span>
        </button>
        <button class="hud-chip gems" type="button" data-goto="review" aria-label="${due} fichas por repasar">
          <span class="ic">🧠</span><b>${due}</b>
        </button>
        <button class="hud-chip hearts ${hearts === 0 ? 'empty' : ''}" type="button" data-goto="profile" aria-label="${hearts} corazones">
          <span class="ic">${hearts > 0 ? '❤️' : '💔'}</span><b>${hearts}</b>
        </button>
      </div>`;
    el.querySelectorAll('[data-goto]').forEach(b =>
      b.addEventListener('click', () => go(b.dataset.goto)));
  }

  function renderTabs() {
    const el = document.getElementById('tabs');
    const active = (views[current.name] && views[current.name].tab) || current.name;
    el.innerHTML = TABS.map(t => `
      <button class="tab ${t.id === active ? 'on' : ''}" type="button" data-tab="${t.id}">
        <span class="tab-ic">${t.icon}</span><span class="tab-lb">${t.label}</span>
      </button>`).join('');
    el.querySelectorAll('[data-tab]').forEach(b =>
      b.addEventListener('click', () => { CC.fx.sfx.tap(); go(b.dataset.tab); }));
  }

  /* Recompensas obtenidas al terminar una sesión */
  function celebrate() {
    const ach = CC.achievements.refresh();
    const avs = CC.avatars.refresh();
    const items = ach.map(a => ({ icon: a.icon, title: a.name, sub: a.desc }))
      .concat(avs.map(a => ({ svg: a.id, title: 'Nuevo personaje: ' + a.name, sub: a.role })));
    if (!items.length) return;
    let i = 0;
    const show = () => {
      if (i >= items.length) return;
      const it = items[i++];
      CC.fx.sfx.unlock();
      CC.fx.toast(`<div class="toast-in">
          <span class="toast-ic">${it.svg ? CC.avatars.svg(it.svg, 40) : it.icon}</span>
          <span><b>${CC.util.esc(it.title)}</b><small>${CC.util.esc(it.sub)}</small></span>
        </div>`, 2800);
      setTimeout(show, 3000);
    };
    show();
  }

  function boot() {
    CC.store.touchDay();
    CC.store.hearts();
    go('home');
    if (!CC.store.get().profile.name) setTimeout(() => views.welcome && go('welcome'), 60);
  }

  return { register, go, reload, renderHUD, celebrate, boot, get current() { return current; } };
})();
