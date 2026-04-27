---
description: "Requisitos funcionales y user stories de Revista Emergente — QUÉ y POR QUÉ, no cómo"
type: spec
branch: 001-revista-emergente
date: 2026-04-26
---

# Spec — Revista Emergente

## Problema

Revista Emergente es una publicación cultural independiente argentina enfocada en artistas emergentes. Actualmente solo existe en Instagram, lo que limita su alcance, impide publicar contenido largo, y hace imposible que la editora gestione contenido sin depender de una plataforma de terceros.

**Necesidad:** Presencia web propia que replique y amplíe la identidad visual de Instagram, permita publicar entrevistas/coberturas/podcast/sorteos, y dé a los artistas un canal de contacto directo.

---

## Usuarios

| Rol | Descripción |
|---|---|
| **Visitante** | Cualquier persona que accede al sitio. Sin autenticación. Lee contenido, descubre artistas, contacta a la revista. |
| **Administradora** | Una sola usuaria (la editora). Gestiona todo el contenido del sitio desde un panel. Sin conocimientos de código. |

---

## Objetivos del sistema

1. Dar presencia web independiente a la revista (fuera de Instagram).
2. Publicar entrevistas, coberturas de shows, episodios de podcast y sorteos.
3. Permitir a la administradora gestionar todo el contenido sin tocar código.
4. Habilitar un canal de contacto para artistas que quieran aparecer en la revista.

---

## User Stories

### US1 — Home: Descubrir contenido reciente

**Como** visitante,  
**Quiero** ver una página principal con las publicaciones más recientes, un acceso rápido al podcast y coberturas de shows recientes,  
**Para** saber qué está publicando la revista y entrar al contenido que me interesa.

**Criterios de aceptación:**
- [ ] Al cargar `/`, veo el nombre "EMERGENTE" con animación de entrada letra por letra
- [ ] Veo las últimas 6 publicaciones en una grilla
- [ ] Veo un banner destacado del podcast con link al episodio más reciente
- [ ] Veo las últimas 3 coberturas de shows
- [ ] Veo un CTA para artistas que quieran aparecer en la revista
- [ ] El sitio es navegable en mobile

**Escenario (Given-When-Then):**
> Dado que accedo a `/`  
> Cuando la página carga  
> Entonces veo el hero animado, la grilla de contenido y el banner de podcast sin errores

---

### US2 — Explorar entrevistas por categoría

**Como** visitante,  
**Quiero** ver todas las entrevistas y filtrarlas por categoría (música, cine, arte, etc.),  
**Para** encontrar contenido relevante a mis intereses.

**Criterios de aceptación:**
- [ ] En `/entrevistas` veo todas las publicaciones publicadas en grilla
- [ ] Puedo filtrar por categoría: Todos / Música / Cine / Arte / Shows / Podcast
- [ ] Al cambiar filtro, la grilla se actualiza sin recargar página
- [ ] Si hay más de 9 publicaciones, veo paginación
- [ ] Mientras carga, veo un skeleton con pulso

**Escenario:**
> Dado que estoy en `/entrevistas`  
> Cuando selecciono el filtro "Música"  
> Entonces solo veo publicaciones de la categoría Música

---

### US3 — Leer una publicación completa

**Como** visitante,  
**Quiero** leer el contenido completo de una entrevista o publicación,  
**Para** consumir el trabajo editorial de la revista.

**Criterios de aceptación:**
- [ ] En `/entrevistas/:slug` veo imagen de portada, título, subtítulo, categoría, fecha y artista
- [ ] Veo el cuerpo del artículo en formato enriquecido (HTML desde TipTap)
- [ ] Si hay artista asociado, veo su foto, bio y links a redes/Spotify/YouTube
- [ ] Al final, veo "Más entrevistas" con 3 publicaciones relacionadas
- [ ] Si el slug no existe, recibo 404 limpio

**Escenario:**
> Dado que navego a `/entrevistas/entrevista-con-artista-x`  
> Cuando la página carga  
> Entonces veo el artículo completo con el bloque de artista y links a redes

---

### US4 — Explorar coberturas de shows

**Como** visitante,  
**Quiero** ver coberturas fotográficas de shows y recitales,  
**Para** revivir o descubrir eventos de la escena cultural.

**Criterios de aceptación:**
- [ ] En `/shows` veo una grilla de coberturas (imágenes de distintos tamaños, estilo masonry)
- [ ] Al hacer click en una cobertura, voy a `/shows/:slug`
- [ ] En el detalle veo descripción del evento y galería de fotos
- [ ] La galería tiene lightbox full-screen con navegación por teclado y swipe en mobile
- [ ] Si no hay coberturas publicadas, veo mensaje de "próximamente"

**Escenario:**
> Dado que estoy en `/shows/cobertura-festival-x`  
> Cuando click en una foto de la galería  
> Entonces se abre lightbox full-screen y puedo navegar con flechas del teclado

---

### US5 — Escuchar/descubrir el podcast

**Como** visitante,  
**Quiero** ver los episodios del podcast con links directos a Spotify y YouTube,  
**Para** escuchar el podcast en mi plataforma preferida.

**Criterios de aceptación:**
- [ ] En `/podcast` veo lista de episodios publicados con número, título, descripción y duración
- [ ] Cada episodio tiene links directos a Spotify y/o YouTube
- [ ] No hay reproductor embebido nativo (se delega a plataformas externas)
- [ ] Los episodios están ordenados del más reciente al más antiguo

**Escenario:**
> Dado que estoy en `/podcast`  
> Cuando click en "Escuchar en Spotify" del episodio N°3  
> Entonces se abre Spotify en una nueva pestaña

---

### US6 — Conocer la revista

**Como** visitante,  
**Quiero** leer el manifiesto y la historia de Revista Emergente,  
**Para** entender qué es y qué representa la revista.

**Criterios de aceptación:**
- [ ] En `/sobre-nosotros` veo el texto manifiesto de la revista
- [ ] Veo una sección "¿Qué es Emergente?"
- [ ] Veo foto o collage del equipo (actualmente solo la editora)

---

### US7 — Contactar la revista como artista

**Como** artista emergente,  
**Quiero** enviar mis datos y un mensaje a Revista Emergente,  
**Para** que me consideren para aparecer en la revista.

**Criterios de aceptación:**
- [ ] En `/contacto` veo formulario con: Nombre, Email, Nombre del proyecto, Instagram, Mensaje
- [ ] Veo texto introductorio: "SE BUSCA gente relacionada al ambiente artístico..."
- [ ] Si dejo campos requeridos vacíos, veo mensajes de error inline antes de enviar
- [ ] Al enviar con éxito, veo mensaje de confirmación
- [ ] No puedo enviar el formulario dos veces seguidas (protección anti-spam básica)

**Escenario:**
> Dado que completo todos los campos del formulario  
> Cuando click "Enviar"  
> Entonces veo confirmación y el mensaje llega al panel de admin

---

### US8 — Acceder al panel de administración

**Como** administradora,  
**Quiero** hacer login con email y password,  
**Para** acceder al panel de gestión de contenido.

**Criterios de aceptación:**
- [ ] En `/admin/login` veo formulario de email + password
- [ ] Si las credenciales son correctas, me redirige a `/admin`
- [ ] Si las credenciales son incorrectas, veo mensaje de error (genérico, sin revelar cuál campo falló)
- [ ] Si ya tengo sesión activa, me redirige directo a `/admin`
- [ ] Tras 5 intentos fallidos en 15 minutos, se bloquea temporalmente

**Escenario:**
> Dado que ingreso credenciales incorrectas 5 veces seguidas  
> Cuando intento el sexto login  
> Entonces veo mensaje de bloqueo temporal

---

### US9 — Gestionar publicaciones

**Como** administradora,  
**Quiero** crear, editar, publicar y eliminar publicaciones (entrevistas, coberturas, sorteos),  
**Para** gestionar todo el contenido editorial del sitio sin tocar código.

**Criterios de aceptación:**
- [ ] En `/admin/publicaciones` veo tabla con todas las publicaciones (incluyendo borradores)
- [ ] Puedo filtrar por status: Todos / Publicados / Borradores
- [ ] Puedo crear nueva publicación con editor TipTap, subir imagen de portada, asignar categoría y artista
- [ ] Puedo guardar como borrador o publicar directamente
- [ ] Puedo editar cualquier publicación existente
- [ ] Puedo cambiar status (publicar/despublicar) con un click
- [ ] Puedo eliminar con confirmación explícita
- [ ] El slug se genera automáticamente desde el título (editable)

**Escenario:**
> Dado que creo una publicación como borrador  
> Cuando click "Publicar" en la tabla  
> Entonces el status cambia a "publicado" y aparece en el sitio público

---

### US10 — Gestionar artistas

**Como** administradora,  
**Quiero** crear y editar perfiles de artistas,  
**Para** asociarlos a publicaciones y darles visibilidad en el sitio.

**Criterios de aceptación:**
- [ ] En `/admin/artistas` veo tabla de artistas con foto thumbnail
- [ ] Puedo crear artista con: nombre, bio, foto, Instagram URL, Spotify URL, YouTube URL, SoundCloud URL
- [ ] Puedo editar y eliminar artistas existentes
- [ ] Al asociar un artista a una publicación, su perfil aparece en el detalle del artículo

---

### US11 — Gestionar podcast

**Como** administradora,  
**Quiero** agregar y editar episodios del podcast,  
**Para** mantener actualizada la sección de podcast del sitio.

**Criterios de aceptación:**
- [ ] En `/admin/podcast` veo tabla con número, título, duración y status
- [ ] Puedo crear episodio con: título, descripción, número, duración, URLs de Spotify/YouTube, imagen de portada, status
- [ ] Puedo publicar/despublicar y eliminar episodios

---

### US12 — Gestionar coberturas de shows

**Como** administradora,  
**Quiero** crear coberturas de shows con galerías de fotos,  
**Para** documentar los recitales y eventos que cubre la revista.

**Criterios de aceptación:**
- [ ] En `/admin/shows` puedo crear cobertura con: título, venue, fecha, descripción, imagen de portada, galería (upload múltiple)
- [ ] Puedo reordenar fotos de la galería
- [ ] Puedo publicar/despublicar y eliminar coberturas

---

### US13 — Gestionar solicitudes de contacto

**Como** administradora,  
**Quiero** ver y gestionar los mensajes que envían los artistas,  
**Para** responder y hacer seguimiento de las propuestas recibidas.

**Criterios de aceptación:**
- [ ] En `/admin/contacto` veo lista de solicitudes con nombre, proyecto, fecha y status
- [ ] Las solicitudes nuevas (sin leer) tienen badge rojo visible en el dashboard
- [ ] Al hacer click en una, veo drawer lateral con todos los datos
- [ ] Puedo marcar como leída, archivar, o abrir el cliente de email nativo para responder
- [ ] El dashboard muestra contador de solicitudes pendientes

---

## Requisitos no funcionales

| Área | Requisito |
|---|---|
| **Seguridad** | JWT en httpOnly cookie. Bcrypt 12 rounds. Rate limiting en login y contacto. Queries parametrizadas. CORS restringido. |
| **Uploads** | Solo jpg, png, webp. Máximo 5MB. Renombrado con UUID en servidor. |
| **Mobile** | El sitio público debe ser completamente usable en mobile (diseño responsive). |
| **Performance** | Imágenes con lazy loading. Build de React minificado y servido por NGINX. |
| **Accesibilidad** | Contraste mínimo AA en texto sobre fondos oscuros. Navegación por teclado en lightbox de galería. |
| **SEO** | Slugs descriptivos en todas las URLs públicas. Meta tags en páginas de detalle. |

---

## Criterios de éxito del sistema

- La administradora puede publicar una nueva entrevista completa (con imagen, artista asociado y cuerpo TipTap) en menos de 5 minutos sin asistencia técnica.
- Un visitante puede llegar desde Google, leer una entrevista completa y navegar a otro artículo sin fricción.
- Las solicitudes de contacto llegan al panel admin dentro de los segundos de ser enviadas.

---

## Supuestos y limitaciones

- **Un solo admin:** No hay sistema de roles ni múltiples usuarios. Un seed script crea la única cuenta.
- **Sin reproductor de podcast:** Se delega a Spotify/YouTube. No hay audio nativo.
- **Sorteos:** Se gestionan como publicaciones con categoría "sorteo" — sin lógica de sorteo automatizado.
- **Sin comentarios:** El sitio es editorial, no social. No hay sistema de comentarios.
- **Sin búsqueda full-text:** v1 no incluye búsqueda interna (roadmap futuro).
- **Idioma:** Todo el contenido es en español rioplatense.

---

## Áreas que necesitan clarificación

- [ ] [NEEDS CLARIFICATION] ¿La función de "sorteo" requiere algún mecanismo de participación (formulario, fecha límite) o solo es un artículo con categoría sorteo?
- [ ] [NEEDS CLARIFICATION] ¿Las notificaciones de email para nuevas solicitudes de contacto son requeridas en v1 o son opcionales?
- [ ] [NEEDS CLARIFICATION] ¿El perfil de artista (`/artistas/:slug`) es una página pública con URL o solo aparece en el bloque dentro de cada artículo?
