---
title: Acerca de
---

kphoto es una demostración de lo que es posible con **TypeScript 7 y la web
moderna**: un blog completo sin dependencias en tiempo de ejecución, sin
framework y sin recursos externos, salvo una API opcional de estadísticas que
el sitio nunca espera.

## Qué significa aquí «nada añadido»

- el generador de sitios estáticos, el analizador de YAML, el lector de
  frontmatter y el renderizador de markdown están escritos desde cero en
  TypeScript
- `tsc` es el **compilador nativo** de TypeScript 7
- los componentes (cabecera, pie, tarjetas, selector de tema) aíslan su propio
  CSS con declarative shadow DOM
- los temas, las transiciones de vista y la persistencia usan solo lo que los
  navegadores actuales ya incluyen

## Estadísticas en directo, sin rastreo

El pie de página puede mostrar cuántas personas están leyendo ahora mismo, y
[la página en directo](/es/live/) enumera lo que se ha leído hoy. No intervienen
direcciones IP, cookies ni identificadores guardados, nada se conserva más de
25 horas y las visitas no se cuentan si tu navegador envía Global Privacy
Control. Si el servidor de estadísticas no responde, las cifras desaparecen
discretamente y nada más cambia.

Este sitio guarda tres cosas en el almacenamiento local de tu navegador: tu
tema, el último idioma que elegiste y, solo si el servidor de estadísticas no
respondió, cuándo volver a intentarlo.

## En más de un idioma

Las páginas y los artículos se pueden traducir de archivo en archivo. Lo que
aún no está traducido sigue siendo legible en su idioma original y se indica
con claridad. Las traducciones al español se han hecho con ayuda de IA.

## Hecho en abierto, con IA

Todo el proyecto (código, pruebas, integración continua y esta misma página)
vive en [un único repositorio público](https://github.com/kphoto/kphoto.github.io)
bajo AGPL-3.0-or-later. Se desarrolla con una ayuda sustancial de IA/LLM; el
README explica exactamente cómo.

## La pila, de un tirón

TypeScript 7 · Vite · Vitest · Playwright · GitHub Actions · GitHub Pages, y en
tiempo de ejecución, nada de lo anterior.
