/* Bienvenida: nombre y personaje inicial. */
window.CC = window.CC || {};

CC.app.register('welcome', {
  chrome: false,
  render(root) {
    const s = CC.store.get();
    root.innerHTML = `
      <div class="welcome">
        <div class="welcome-art">${CC.avatars.svg('avi', 120, 'bob')}</div>
        <h1>Bienvenida a bordo</h1>
        <p class="lead">Tu examen final de tripulante de cabina, convertido en 84 fichas, 10 unidades y repaso Anki.</p>
        <label class="field">
          <span>¿Cómo te llamamos?</span>
          <input type="text" id="wel-name" placeholder="Tu nombre" maxlength="24" autocomplete="given-name">
        </label>
        <p class="field-lb">Elige tu copiloto</p>
        <div class="wel-avs">
          ${['avi', 'lia'].map((id, i) => `
            <button class="wel-av ${i === 0 ? 'on' : ''}" type="button" data-av="${id}">
              ${CC.avatars.svg(id, 68)}<b>${CC.avatars.byId(id).name}</b>
            </button>`).join('')}
        </div>
        <button class="btn primary big full" type="button" id="wel-go">EMPEZAR</button>
        <p class="hint center">Podrás desbloquear más personajes según avances.</p>
      </div>`;

    let av = 'avi';
    root.querySelectorAll('[data-av]').forEach(b => b.addEventListener('click', () => {
      av = b.dataset.av;
      root.querySelectorAll('[data-av]').forEach(x => x.classList.toggle('on', x === b));
      CC.fx.sfx.tap();
    }));
    root.querySelector('#wel-go').addEventListener('click', () => {
      const n = root.querySelector('#wel-name').value.trim();
      s.profile.name = n || 'Tripulante';
      s.profile.avatar = av;
      CC.store.save();
      CC.fx.sfx.win();
      CC.app.go('home');
    });
  }
});
