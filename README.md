# Cabin Crew Academy ✈️

El examen final de tripulante de cabina convertido en una web app móvil, gamificada
y con fichas de repetición espaciada estilo Anki.

Todo el temario del examen (84 fichas repartidas en 10 unidades) está en
[`js/data.js`](js/data.js), con la referencia al número de pregunta original.

## Qué incluye

- **Ruta de unidades** al estilo Duolingo: nodos por lección, corazones, XP, niveles,
  rangos (de *Cadete* a *Instructor de cabina*), racha diaria y meta diaria.
- **Fichas Anki de verdad**: algoritmo SM-2 con pasos de aprendizaje (1 y 10 min),
  factor de facilidad, recaídas y calificaciones *Otra vez / Difícil / Bien / Fácil*,
  con la previsión del próximo repaso en cada botón.
- **4 tipos de ejercicio** generados automáticamente desde el temario:
  opción múltiple (directa e inversa), selección múltiple, ordenar pasos de un
  procedimiento y emparejar (por ejemplo, los colores de las luces de llamado).
- **Simulacro de examen**: 30 preguntas al azar, cronómetro, nota, unidades flojas y
  repaso de los fallos. También hay simulacro por unidad.
- **Personajes desbloqueables** dibujados en SVG: aviones y tripulantes (Avi, Lía,
  Capitán Max, Tito, Nimbo, Chispa, Bali, Kit, Rosa, Jet y Luna).
- **Logros**, estadísticas por unidad, gráfico de actividad semanal y estado del mazo
  (nuevas / aprendiendo / jóvenes / maduras).
- **PWA instalable y offline**: funciona sin conexión y se puede añadir a la pantalla
  de inicio del móvil.

## Cómo usarla

Es HTML, CSS y JavaScript sin dependencias ni compilación.

```bash
# en local
python3 -m http.server 8000
# y abrir http://localhost:8000
```

Para publicarla: *Settings → Pages → Deploy from a branch* y elegir la rama.
Al abrirla en el móvil, «Añadir a pantalla de inicio» la instala como app.

El progreso se guarda en `localStorage` del propio dispositivo. En
**Perfil → Ajustes** puedes copiar tu progreso e importarlo en otro móvil.

## Estructura

```
index.html              Shell de la app (HUD, pantalla, pestañas)
manifest.webmanifest    PWA
sw.js                   Service worker (offline)
styles/app.css          Sistema visual: tokens, modo claro y oscuro
js/data.js              El temario del examen (fichas y unidades)
js/util.js              Utilidades y render de respuestas
js/srs.js               Repetición espaciada SM-2
js/store.js             Estado: XP, niveles, racha, corazones, mazo
js/exercise.js          Generación y render de ejercicios
js/avatars.js           Personajes SVG y sus desbloqueos
js/achievements.js      Logros
js/fx.js                Sonido, vibración, confeti y avisos
js/app.js               Enrutador y HUD
js/views/               Pantallas: bienvenida, ruta, lección/examen, repaso, fichas, perfil
```

## Añadir o corregir contenido

Cada ficha de `js/data.js` tiene esta forma:

```js
{ id: 'f3', unit: 'emer', type: 'num', ref: 39,
  q: '¿A qué temperatura se activa el gas freón?',
  a: 'A los 78 °C',
  options: ['A los 78 °C', 'A los 68 °C', 'A los 88 °C', 'A los 100 °C'] }
```

Tipos disponibles: `def` (definición), `num` (dato con opciones), `list` (lista con
`items` y `lures`), `order` (pasos en orden) y `match` (pares). Las lecciones se
generan solas en grupos de 4 fichas, así que basta con añadir la ficha a su unidad.
