# Cabin Crew Academy ✈️

El examen final de tripulante de cabina convertido en una web app móvil, gamificada
y con fichas de repetición espaciada estilo Anki.

Todo el temario del examen (84 fichas repartidas en 10 unidades) está en
[`js/data.js`](js/data.js), con la referencia al número de pregunta original.
El banco de preguntas del *Examen de Auxiliar de Cabina* de la Autoridad de Aviación
Civil de El Salvador (AAC, 149 preguntas en 13 unidades) está en
[`js/data-aac.js`](js/data-aac.js), con su número de pregunta en el PDF y la
respuesta que marca la clave oficial.

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
- **Banco AAC**: las preguntas oficiales de opción múltiple (3 opciones o verdadero/falso),
  numeradas 1-2-3 como en el examen. Las opciones que dependen de las demás
  (*«ambas»*, *«1 y 2 son correctas»*, *«ninguna de las anteriores»*) mantienen el orden
  original; el resto se barajan.
- **Filtro de origen** (*Todo / Examen final / Banco AAC*) en la ruta, las fichas y el
  simulacro: estudia las dos fuentes juntas o cada una por separado. Cada origen tiene
  su propio tramo de ruta, así que filtrar no bloquea ni borra progreso, y en la vista
  *Todo* cada ficha lleva su etiqueta (`FINAL` o `AAC`).
- **Personajes desbloqueables** dibujados en SVG: aviones y tripulantes (Avi, Lía,
  Capitán Max, Tito, Nimbo, Chispa, Bali, Kit, Rosa, Jet y Luna).
- **Logros**, estadísticas por unidad, gráfico de actividad semanal y estado del mazo
  (nuevas / aprendiendo / jóvenes / maduras).
- **Extensión *English for Aviation*** (ESL): inglés técnico de aviación para
  hispanohablantes, con su propia ruta, mazo Anki, fichas y simulacro. Se cambia de
  curso con el selector de la parte superior de la ruta. Unidades: seguridad en el
  aeropuerto, seguridad en el avión, *customer service*, partes y fases del vuelo,
  anuncios y emergencias, y alfabeto y fraseología OACI. Con botón 🔊 para escuchar
  la pronunciación en inglés.
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
js/data-aac.js          Banco de preguntas del examen de la AAC de El Salvador
js/data-esl.js          Extensión de inglés técnico de aviación (ESL)
js/courses.js           Cursos: filtra unidades y fichas según el curso activo
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
`items` y `lures`), `order` (pasos en orden), `match` (pares) y `mc` (pregunta de
examen con sus `options` en el orden original; con dos opciones es verdadero/falso).
Las lecciones se generan solas en grupos de 4 fichas, así que basta con añadir la
ficha a su unidad.

Las unidades del curso TCP llevan un origen (`src`): `final` para las de `js/data.js`
y `aac` para las de `js/data-aac.js`. Para sumar otra fuente, se declara en `sources`
del curso en `js/courses.js` y se le da ese `src` a sus unidades; el filtro la muestra
sola.

Las fichas de la extensión de inglés están en `js/data-esl.js` y usan los mismos
tipos. En las `def`, `term` es la expresión en inglés y `a` su traducción; el campo
opcional `say` es el texto que lee el botón 🔊 (por defecto, `term`).
