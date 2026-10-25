import type { Catalog } from './index.ts';

export const es: Partial<Catalog> = {
  'site.description': 'Una demostración de lo que es posible con TypeScript 7 y la web moderna.',
  skipLink: 'Saltar al contenido',
  'nav.label': 'Principal',
  'nav.blog': 'Blog',
  'nav.tags': 'Etiquetas',
  'nav.series': 'Series',
  'nav.authors': 'Autores',
  'nav.labs': 'Laboratorio',
  'nav.about': 'Acerca de',
  'nav.contact': 'Contacto',
  'theme.label': 'Tema',
  'theme.system': 'Sistema',
  'theme.light': 'Claro',
  'theme.dark': 'Oscuro',
  'theme.solarizedLight': 'Solarized claro',
  'theme.solarizedDark': 'Solarized oscuro',
  'language.label': 'Idioma',
  'language.suggest': 'Lee esta página en español',
  'footer.repoTitle': '{title} en GitHub',
  'footer.repoTagline':
    'Cada línea de este sitio —código, pruebas e integración continua— es pública.',
  'footer.builtWith': 'Hecho con TypeScript 7 y sin dependencias en tiempo de ejecución',
  'footer.aiDisclosure': 'Desarrollado con una ayuda sustancial de IA/LLM',
  'footer.feed': 'Feed Atom',
  'footer.commit': 'Compilado desde {commit}',
  'footer.modified': 'con cambios locales',
  'post.readingTime': { one: '{count} min de lectura', other: '{count} min de lectura' },
  'post.episode': 'ep. {episode}',
  'post.tags': 'Etiquetas',
  'post.inLanguage': 'En {language}',
  'post.translatedFrom': 'Traducido del {language}.',
  'post.readOriginal': 'Leer el original',
  'post.writtenBy': 'Escrito por',
  'post.narrated': 'con audio',
  'narration.label': 'Escucha este artículo',
  'narration.note':
    'Leído en voz alta por una voz generada con IA; el artículo de abajo es la transcripción.',
  'series.nav': 'Serie',
  'series.position': 'Parte {episode} de {total} de {series}',
  'author.postCount': { one: '{count} artículo', other: '{count} artículos' },
  'home.title': 'La web moderna, hecha a mano.',
  'home.lede':
    '{description} Cada artículo es un archivo markdown; cada analizador, componente y tema de este sitio está escrito desde cero, sin framework y sin dependencias en tiempo de ejecución.',
  'home.latest': 'Últimos artículos',
  'home.allPosts': 'Todos los artículos →',
  'blog.title': 'Blog',
  'blog.lede': {
    one: '{count} artículo, del más reciente al más antiguo.',
    other: '{count} artículos, del más reciente al más antiguo.',
  },
  'blog.description': 'Todos los artículos de {site}, del más reciente al más antiguo.',
  'tags.title': 'Etiquetas',
  'tags.lede': 'Todos los temas del sitio.',
  'tags.description': 'Todas las etiquetas de {site}.',
  'tag.eyebrow': 'Etiqueta',
  'tag.title': 'Etiquetado «{tag}»',
  'tag.description': 'Artículos etiquetados «{tag}» en {site}.',
  'series.title': 'Series',
  'series.lede': 'Artículos que van juntos, en orden de lectura.',
  'series.description': 'Todas las series de {site}.',
  'series.parts': { one: '{count} parte', other: '{count} partes' },
  'series.eyebrow': 'Serie',
  'series.pageLede': { one: '{count} parte, en orden.', other: '{count} partes, en orden.' },
  'series.pageDescription': 'La serie «{series}» de {site}, en orden de lectura.',
  'authors.title': 'Autores',
  'authors.lede': 'Las personas que escriben aquí.',
  'authors.description': 'Los autores de {site}.',
  'author.eyebrow': 'Autor',
  'author.postsBy': 'Artículos de {name}',
  'author.noPosts': 'Todavía no hay artículos.',
  'author.description': 'Artículos de {name} en {site}.',
  'page.description': '{title} — {description}',
  'notFound.title': 'Página no encontrada',
  'notFound.description': 'Esta página no existe.',
  'notFound.eyebrow': '404',
  'notFound.heading': 'No hay nada en esta dirección.',
  'notFound.lede':
    'Puede que la página se haya movido o que la URL tenga un error. Las URL de los artículos empiezan por su fecha, como {example}.',
  'notFound.home': 'Ir a la página de inicio',
  'notFound.browse': 'ver todos los artículos',
  'notFound.actions': '{home} o {browse}.',
  'live.title': 'Estadísticas en directo',
  'live.description': 'Estadísticas de lectura en directo y respetuosas con la privacidad.',
  'live.eyebrow': 'En directo',
  'live.lede':
    'Quién está leyendo ahora mismo y qué se ha leído en el último día. No existe nada con más de 25 horas de antigüedad.',
  'live.off':
    'Las estadísticas en directo están desactivadas en esta compilación. Todo lo demás funciona exactamente igual.',
  'live.noscript':
    'Las estadísticas en directo necesitan JavaScript. Todo lo demás en este sitio funciona sin él.',
  'live.privacyHeading': 'Qué se recoge',
  'live.privacy1':
    'Mientras una página está abierta y visible, tu navegador se comunica cada 30 segundos con tres datos: un identificador aleatorio que generó al cargar la página (solo en memoria, nunca en una cookie ni en el almacenamiento), la ruta de la página y si se trata de una nueva visita. Al ocultar o cerrar la pestaña, el identificador se elimina de inmediato; si ese mensaje se pierde, deja de contar 90 segundos después y se borra en pocos minutos.',
  'live.privacy2':
    'Las visitas se guardan solo como un recuento por página y por minuto, y esos recuentos se borran a las 25 horas. No se guarda ninguna dirección IP, dato del navegador, referente ni cuenta: la base de datos no tiene dónde guardarlos.',
  'live.privacy3':
    'Las visitas no se cuentan en absoluto si tu navegador envía {gpc}, ni para navegadores automatizados. Las cifras proceden de una base de datos opcional de {supabase} en su plan gratuito; si alguna vez no está disponible, las cifras simplemente desaparecen y el resto del sitio no se ve afectado. Todo el diseño, incluido el esquema de la base de datos, está en el {repo}.',
  'live.repoLink': 'repositorio público',
  'live.label': 'En directo',
  'live.link': 'Estadísticas en directo →',
  'live.readers': { one: '{count} lector', other: '{count} lectores' },
  'live.views': { one: '{count} visita', other: '{count} visitas' },
  'live.summary':
    '{readers} en el sitio ahora mismo, {pageNow} en esta página · {views} en las últimas 24 horas',
  'live.here': 'Aquí ahora mismo',
  'live.views1h': 'Visitas, última hora',
  'live.views24h': 'Visitas, últimas 24 horas',
  'live.busiest': 'Páginas más visitadas',
  'live.colPage': 'Página',
  'live.colNow': 'Aquí ahora',
  'live.col1h': 'Visitas, 1 h',
  'live.col24h': 'Visitas, 24 h',
  'live.connecting': 'Conectando con las estadísticas en directo…',
  'live.updated': 'Actualizado',
  'live.unavailable':
    'Las estadísticas en directo no están disponibles ahora mismo. El resto del sitio no se ve afectado.',
  'live.stillTrying': 'Seguimos intentando conectar con las estadísticas en directo…',
  'live.reconnecting': 'Reconectando…',
  'live.empty': 'Todavía no hay visitas en las últimas 24 horas.',
  'labs.title': 'Laboratorio',
  'labs.lede': 'Páginas interactivas que desmontan una idea de la web y muestran cómo funciona.',
  'labs.description': 'Explicaciones interactivas en {site}.',
  'lab.eyebrow': 'Laboratorio',
  'lab.flapping.title': 'Cómo vuela el avión que aletea',
  'lab.flapping.summary':
    'Un folioscopio de dibujos a mano, y el reloj, la precarga y las tres técnicas de dibujo que lo hacen volar.',
  'lab.flapping.description':
    'Explicación interactiva de la animación del avión que aletea: fotogramas, tiempo, precarga y dibujo con imagen, canvas y CSS.',
  'lab.flapping.lede':
    'El avión de flappingairplanes.com parece vivo, pero es un folioscopio: {count} dibujos mostrados uno tras otro, {fps} veces por segundo. Los mismos dibujos se reproducen abajo. Páusalos, avanza de uno en uno, cambia la velocidad y la forma de dibujarlos; cada sección explica una pieza.',
  'lab.flapping.credit':
    'Dibujos e idea de la animación de Flapping Airplanes ({site}). Todo lo demás en esta página está escrito desde cero, sin React, WebGL ni ninguna biblioteca.',
  'lab.flapping.disclaimer':
    'Aviso: estas imágenes pertenecen a Flapping Airplanes y se usan aquí solo con fines educativos y de demostración. No están cubiertas por la licencia AGPL de este sitio, y esta página no está afiliada a Flapping Airplanes ni cuenta con su respaldo.',
  'lab.flapping.codeLabel': 'Ejemplo de código',
  'lab.flapping.flipbookHeading': 'Es un folioscopio',
  'lab.flapping.flipbook1':
    'No hay física en las alas. Alguien dibujó el avión {count} veces, cada dibujo un poco más avanzado en un aleteo, y los guardó como {files}. Mostrados rápido y en orden, el ojo completa el movimiento: el mismo truco que un folioscopio de papel o un rollo de película.',
  'lab.flapping.flipbook2':
    'Pulsa los botones de paso y mira cómo cambia el nombre del archivo. La tira de película bajo los controles es la animación entera extendida.',
  'lab.flapping.clockHeading': 'El tiempo decide el fotograma',
  'lab.flapping.clock1':
    'La página nunca cuenta refrescos de pantalla. Pregunta cuánto tiempo lleva en marcha la animación y lo convierte en un número de fotograma:',
  'lab.flapping.clock2':
    'El original hace exactamente esto con {fps} fotogramas por segundo. Como la respuesta solo depende del tiempo transcurrido, el avión aletea a la misma velocidad en un portátil de 60 Hz y en un monitor de 144 Hz; una pantalla más rápida simplemente muestra cada dibujo unas cuantas veces más. El panel de arriba enseña los números en directo.',
  'lab.flapping.loopHeading': 'Un bucle, al ritmo de la pantalla',
  'lab.flapping.loop1':
    '{raf} ejecuta una función justo antes de que el navegador pinte. Se detiene sola en las pestañas en segundo plano, así que un folioscopio oculto no cuesta nada.',
  'lab.flapping.loop2':
    'Esta página además detiene el bucle cuando el folioscopio sale de la vista, con un {observer}, y solo toca la imagen cuando el número de fotograma cambia de verdad.',
  'lab.flapping.preloadHeading': 'Cargar cada dibujo antes del primer aleteo',
  'lab.flapping.preload1':
    'Si un dibujo aún se está descargando cuando le toca, el avión tartamudea o parpadea. Por eso todos los dibujos se piden al principio y se decodifican antes de reproducir:',
  'lab.flapping.preload2':
    '{decode} se resuelve cuando los píxeles están listos para pintarse, así que cambiar a ese dibujo después nunca espera a la red ni al decodificador. La línea de estado sobre los controles avisa cuando los {count} están listos.',
  'lab.flapping.drawHeading': 'Tres formas de poner un dibujo en pantalla',
  'lab.flapping.draw1':
    'Usa «Dibujar con» para cambiar de técnica. El movimiento debería verse idéntico, y de eso se trata.',
  'lab.flapping.drawImage':
    'Imagen: cambiar el {src} de un único {img}. La versión más sencilla, y con los dibujos decodificados es instantánea.',
  'lab.flapping.drawCanvas':
    'Canvas: pintar un {bitmap} en un {canvas} 2D con {drawImage}. Más código, pero la misma superficie podría mezclar cualquier otra cosa que dibujes.',
  'lab.flapping.drawCss':
    'CSS: una regla {keyframes} con una parada por dibujo y temporización {steps}, para que el fondo salte de dibujo en dibujo en lugar de fundirse. Funciona incluso con JavaScript desactivado; aquí el script solo lo dirige mediante la {waapi}, porque toda animación CSS es también un objeto {animation}.',
  'lab.flapping.inkHeading': 'Tinta sobre cualquier papel',
  'lab.flapping.ink1':
    'Los dibujos son tinta negra sobre papel crema. Un {filter} lleva el papel a blanco puro y la tinta a negro puro; después {multiply} deja que el color de la página sustituya al blanco. Los temas oscuros añaden {invert} y mezclan con {screen}, así que el avión se vuelve tinta clara sobre una página oscura. Elige un tema en la cabecera para verlo cambiar.',
  'lab.flapping.originalHeading': 'Lo que añade el original',
  'lab.flapping.original1':
    'flappingairplanes.com envuelve el mismo folioscopio en mucho más: React, la biblioteca WebGL regl, una simulación de fluidos que fluye alrededor del avión y sigue al puntero, y un paso que convierte cada dibujo en una máscara, donde cada píxel más oscuro que un umbral cuenta como avión, para que el aire rodee su silueta.',
  'lab.flapping.original2':
    'También asciende al desplazarte: durante el primer 60 % de una pantalla el avión se inclina hasta {degrees}° y luego se desvanece entre el 48 % y el 66 %. El control Ascenso usa las mismas dos curvas, una recta para la inclinación y un smoothstep para el desvanecido.',
  'lab.flapping.original3':
    'Nada de eso hace falta para el aleteo en sí, por eso esta página se queda en el folioscopio.',
  'lab.flapping.politeHeading': 'Una animación educada',
  'lab.flapping.polite1':
    'Si tu sistema pide {reduced}, el folioscopio empieza en pausa. Tu velocidad, la técnica de dibujo y si pulsaste reproducir o pausa por última vez se guardan en el localStorage de este navegador bajo {key}, así que la página lo recuerda la próxima vez.',
  'flipbook.stageLabel': 'Un avión dibujado a mano aleteando, un dibujo cada vez',
  'flipbook.caption':
    'Dibujos © Flapping Airplanes, usados solo con fines de demostración. Reproducidos por esta página.',
  'flipbook.noscript':
    'Sin JavaScript los dibujos se reproducen igualmente solo con CSS; los controles necesitan JavaScript.',
  'flipbook.loading': 'Cargando dibujos…',
  'flipbook.ready': 'Listo: los {count} dibujos están decodificados.',
  'flipbook.failed':
    'No se pudieron cargar algunos dibujos. Recarga la página para volver a intentarlo.',
  'flipbook.previous': 'Fotograma anterior',
  'flipbook.next': 'Fotograma siguiente',
  'flipbook.play': 'Reproducir',
  'flipbook.pause': 'Pausa',
  'flipbook.frame': 'Fotograma',
  'flipbook.fps': 'Fotogramas por segundo',
  'flipbook.climb': 'Ascenso',
  'flipbook.renderer': 'Dibujar con',
  'flipbook.rendererImage': 'Imagen',
  'flipbook.rendererCanvas': 'Canvas',
  'flipbook.rendererCss': 'Solo CSS',
  'flipbook.time': 't (segundos)',
  'flipbook.product': 't × fps',
  'flipbook.index': 'Índice, mód. {count}',
  'flipbook.file': 'Archivo',
};
