# CONTENIDO-DEPORTIVO · WOLFGAMES

Web estática publicada con GitHub Pages: <https://steven2506.github.io/CONTENIDO-DEPORTIVO/>

## Estructura

- `index.html`: portada y próximos eventos.
- `F1.html` / `f1calendar.js`: calendario de Fórmula 1 y enlaces a las fichas maestras.
- `gp.html?id=monza` / `gp.js` / `gp.css`: plantilla reutilizable para las fichas de cada Gran Premio; la identidad visual por ronda vive en `f1-data.js`.
- `MotoGP.html` / `motogpcalendar.js`: calendario de MotoGP.
- `deportes.html` / `sports-data.js`: LaLiga y Champions League.
- `site.js`: cabecera, navegación, pie y comportamiento compartido.
- `diseno.css`: sistema visual y adaptación móvil.
- `particles.js`: fondo animado accesible.
- `manifest.webmanifest`: identidad, accesos directos e iconos de la aplicación instalable.
- `sw.js`: actualización y caché segura de la PWA.
- `offline.html`: respuesta accesible cuando no hay conexión.

## Aplicación instalable

WOLFGAMES funciona como PWA bajo el alcance `/CONTENIDO-DEPORTIVO/`. Los documentos y archivos deportivos usan una estrategia **network first** con `cache: no-store`: siempre se intenta obtener la versión pública más reciente y la copia local solo se utiliza si falla la conexión. Los recursos visuales y scripts estables usan caché local.

Al cambiar el service worker debe incrementarse `CACHE_VERSION`. Cuando hay una versión instalada activa, la interfaz ofrece al usuario actualizarla y recarga después de que el nuevo worker toma el control.

## Widget de Windows 11

La PWA publica una agenda deportiva para el panel de Widgets de Windows 11. Edge presenta la plantilla Adaptive Card y el service worker actualiza su contenido al instalarse, reanudarse o recibir una sincronización periódica. `scripts/build_widget_data.js` genera el resumen público de marcadores y próximas sesiones; el workflow `update-widget-data.yml` lo vuelve a generar cada quince minutos y cuando cambian las fuentes deportivas.

El widget muestra hasta tres partidos o sesiones en hora peninsular española y abre la página de WOLFGAMES asociada al primer evento. La frecuencia real de actualización la controla Windows y puede ser menos frecuente que el intervalo solicitado.

## Rendimiento

- Los datos deportivos solo se cargan en las páginas que los necesitan.
- La comprobación de resultados utiliza una petición `HEAD`; el archivo completo únicamente se descarga cuando la página se recarga tras detectar una versión nueva.
- Las animaciones se limitan a 30 FPS, reducen su complejidad en móvil o con ahorro de datos y se detienen cuando la pestaña queda oculta.
- Las secciones fuera de la pantalla utilizan `content-visibility` para posponer su composición sin modificar el diseño.

## Actualización

Los calendarios se editan en sus archivos JavaScript de datos. Los partidos de fútbol se actualizan en `sports-data.js`. La web se publica desde `main` mediante GitHub Pages.

## Fuentes deportivas

Las fechas se contrastan con Formula1.com, MotoGP.com, LALIGA.com y UEFA.com.
