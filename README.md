# CONTENIDO-DEPORTIVO · WOLFGAMES

Web estática publicada con GitHub Pages: <https://steven2506.github.io/CONTENIDO-DEPORTIVO/>

## Estructura

- `index.html`: portada y próximos eventos.
- `F1.html` / `f1calendar.js`: calendario de Fórmula 1.
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

## Rendimiento

- Los datos deportivos solo se cargan en las páginas que los necesitan.
- La comprobación de resultados utiliza una petición `HEAD`; el archivo completo únicamente se descarga cuando la página se recarga tras detectar una versión nueva.
- Las animaciones se limitan a 30 FPS, reducen su complejidad en móvil o con ahorro de datos y se detienen cuando la pestaña queda oculta.
- Las secciones fuera de la pantalla utilizan `content-visibility` para posponer su composición sin modificar el diseño.

## Actualización

Los calendarios se editan en sus archivos JavaScript de datos. Los partidos de fútbol se actualizan en `sports-data.js`. La web se publica desde `main` mediante GitHub Pages.

## Fuentes deportivas

Las fechas se contrastan con Formula1.com, MotoGP.com, LALIGA.com y UEFA.com.
