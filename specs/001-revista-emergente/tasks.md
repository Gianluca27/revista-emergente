---
description: "Lista de tareas ordenadas para implementar Revista Emergente — basado en plan.md"
type: tasks
input: specs/001-revista-emergente/plan.md
date: 2026-04-26
---

# Tasks — Revista Emergente

**Input:** `plan.md`, `data-model.md`, `contracts/api-spec.md`  
**Convenciones:**

- `[P]` = puede correr en paralelo (archivos diferentes, sin dependencias)
- `[USn]` = user story que implementa (ver `spec.md`)
- Paths asumen estructura definida en `plan.md`

---

## Phase 1: Setup inicial

**Propósito:** Scaffolding del proyecto, configuración base, base de datos

- [x] T001 Inicializar monorepo con carpetas `client/`, `server/`, `specs/`, `nginx/`
- [x] T002 [P] Crear `client/` con Vite + React 18 (`npm create vite@latest client -- --template react`)
- [x] T003 [P] Crear `server/` con `npm init` + instalar dependencias base de Express
- [x] T004 [P] Configurar Tailwind CSS en `client/` con paleta y fuentes del proyecto (`tailwind.config.js`)
- [x] T005 [P] Agregar Google Fonts (Bebas Neue, Anton, Space Mono, Barlow Condensed) en `client/index.html`
- [x] T006 [P] Crear `.env.example` con todas las variables necesarias (ver `plan.md`)
- [x] T007 [P] Crear `.gitignore` — incluir `node_modules/`, `.env`, `server/uploads/`, `client/dist/`
- [x] T008 Crear `server/migrations/001_initial_schema.sql` con todas las tablas (ver `data-model.md`)
- [x] T009 Crear `server/migrations/002_seed_categories.sql` con las 6 categorías
- [x] T010 Crear `server/scripts/seed-admin.js` — script Node.js que hashea password y crea usuario admin
- [x] T011 Ejecutar migraciones y seed en PostgreSQL local

**Checkpoint:** Base de datos lista, ambos proyectos scaffoldeados, Tailwind funciona con la paleta emergente.

---

## Phase 2: Backend — Auth (bloquea todo el admin)

**Propósito:** Sistema de autenticación completo. Nada del panel admin puede empezar sin esto.

⚠️ **CRÍTICO:** Esta fase bloquea todas las fases admin (Phase 5–10)

- [x] T012 Crear `server/src/app.js` — setup Express con helmet, cors, cookieParser, express.json
- [x] T013 [P] Crear `server/src/middleware/authMiddleware.js` — verify JWT cookie, retorna 401 si inválido
- [x] T014 [P] Crear `server/src/middleware/rateLimiter.js` — limiters para login y contacto
- [x] T015 Crear `server/src/controllers/authController.js` — login, logout, me
- [x] T016 Crear `server/src/routes/auth.routes.js` — montar en `/api/auth`
- [x] T017 Integrar rutas auth en `app.js`
- [x] T018 Verificar: `POST /api/auth/login` → cookie httpOnly; `GET /api/auth/me` → 401 sin cookie

**Checkpoint:** Auth funciona. Puedo obtener un JWT via login y verificarlo.

---

## Phase 3: Backend — CRUD Publicaciones (US2, US3, US9)

- [x] T019 [P] Crear `server/src/models/publications.js` — queries parametrizadas (getAll, getBySlug, create, update, delete, publish/unpublish)
- [x] T020 [P] Crear `server/src/models/categories.js` — getAll
- [x] T021 Crear `server/src/controllers/publicationsController.js` — todas las acciones públicas y admin
- [x] T022 Crear `server/src/routes/publications.routes.js` — rutas públicas + admin con authMiddleware
- [x] T023 Integrar rutas en `app.js`
- [x] T024 Verificar todos los endpoints de publicaciones contra `contracts/api-spec.md`

---

## Phase 4: Backend — CRUD Artistas, Podcast, Shows, Contacto, Upload

**Todos corren en paralelo entre sí** (archivos independientes)

- [x] T025 [P] Crear `server/src/models/artists.js` + `controllers/artistsController.js` + rutas — artistas público y admin
- [x] T026 [P] Crear `server/src/models/podcast.js` + `controllers/podcastController.js` + rutas — podcast público y admin
- [x] T027 [P] Crear `server/src/models/shows.js` + `controllers/showsController.js` + rutas — shows público y admin
- [x] T028 [P] Crear `server/src/models/contact.js` + `controllers/contactController.js` + rutas — contacto público y admin
- [x] T029 [P] Crear `server/src/middleware/uploadMiddleware.js` — Multer + validación MIME + UUID rename
- [x] T030 [P] Crear `server/src/controllers/uploadController.js` + ruta `POST /api/admin/upload`
- [x] T031 Integrar todas las rutas en `app.js`
- [x] T032 Verificar todos los endpoints contra `contracts/api-spec.md`

**Checkpoint backend:** API completa. Todos los endpoints responden correctamente.

---

## Phase 5: Frontend base — Layout y sistema de diseño (bloqueante para todas las páginas)

⚠️ **CRÍTICO:** Esta fase bloquea todas las páginas del sitio público

- [x] T033 [P] Crear `client/src/services/api.js` — instancia Axios con baseURL, withCredentials, interceptor 401
- [x] T034 [P] Crear `client/src/store/authStore.js` — Zustand con `{ user, isAuthenticated, setUser, logout }`
- [x] T035 [P] Crear `client/src/utils/slugify.js` + `formatDate.js`
- [x] T036 Crear `client/src/components/layout/Navbar.jsx` — logo Bebas Neue, links, scroll behavior, mobile menu con AnimatePresence
- [x] T037 Crear `client/src/components/layout/Footer.jsx` — links, redes sociales, texto identitario
- [x] T038 Crear `client/src/components/layout/Layout.jsx` — wrapper con Navbar + Footer + AnimatePresence para transiciones de ruta
- [x] T039 Crear `client/src/App.jsx` — React Router v6 con todas las rutas públicas y admin
- [x] T040 [P] Crear `client/src/components/ui/PublicationCard.jsx` — props title/subtitle/category/coverImage/slug/date, hover rojo
- [x] T041 [P] Crear `client/src/components/ui/CategoryFilter.jsx` — botones pill con estado activo rojo
- [x] T042 [P] Crear `client/src/components/ui/SkeletonCard.jsx` — skeleton con pulso para loading states
- [x] T043 [P] Crear `client/src/components/ui/Badge.jsx` — badge de categoría rojo
- [x] T044 [P] Crear `client/src/hooks/useIntersectionObserver.js` — para animaciones de entrada al viewport
- [x] T045 Crear textura SVG de grano en `client/src/assets/grain.svg` y CSS global para aplicarla

**Checkpoint:** Navbar y Footer renderizan correctamente. Layout base funcional.

---

## Phase 6: Frontend — Home + Hero animado (US1)

- [x] T046 Crear `client/src/components/sections/HeroSection.jsx` — letras "EMERGENTE" con Framer Motion staggerChildren + glitch post-entrada
- [x] T047 Crear `client/src/components/sections/LatestPublications.jsx` — grid 3 col, últimas 6 publicaciones, animación de entrada al viewport
- [x] T048 Crear `client/src/components/sections/PodcastBanner.jsx` — fondo rojo, marquee CSS, link a último episodio
- [x] T049 Crear `client/src/components/sections/RecentShows.jsx` — grid asimétrico (1 grande + 2 chicas), hover con título overlay
- [x] T050 Crear `client/src/components/sections/ArtistCTA.jsx` — call to action artistas, tipografía recortada fanzine
- [x] T051 Crear `client/src/pages/HomePage.jsx` — orquesta las 5 secciones en orden
- [x] T052 Crear `client/src/services/publications.js` — funciones de fetch (getPublications, getFeatured, etc.)
- [x] T053 Verificar HomePage completa en mobile y desktop

**Checkpoint [US1]:** Home carga con hero animado, grilla de publicaciones, banner podcast, shows y CTA artistas.

---

## Phase 7: Frontend — Páginas de listado (US2, US4, US5)

Corren en paralelo una vez que Phase 5 está completa:

- [x] T054 [P] Crear `client/src/pages/EntrevistasPage.jsx` — grid con CategoryFilter, paginación, skeleton loading
- [x] T055 [P] Crear `client/src/pages/ShowsPage.jsx` — grid masonry de coberturas
- [x] T056 [P] Crear `client/src/pages/PodcastPage.jsx` — lista de episodios con número, título, duración, links
- [x] T057 [P] Crear `client/src/pages/SobreNosotrosPage.jsx` — manifiesto, "¿Qué es Emergente?", foto equipo
- [x] T058 Verificar filtrado por categoría en Entrevistas (sin recargar página)

**Checkpoint [US2, US4, US5]:** Páginas de listado funcionan con datos reales de la API.

---

## Phase 8: Frontend — Páginas de detalle (US3, US4)

- [x] T059 Crear `client/src/pages/PublicationDetailPage.jsx` — portada full-width, título, body HTML, bloque artista, "Más entrevistas"
- [x] T060 Crear `client/src/components/sections/ArtistBlock.jsx` — foto, bio, links redes/Spotify (usado en detalle de publicación)
- [x] T061 Crear `client/src/pages/ShowDetailPage.jsx` — descripción + galería con lightbox
- [x] T062 Crear `client/src/components/ui/Lightbox.jsx` — full-screen, navegación teclado (←→Esc), swipe mobile
- [x] T063 [P] Crear `client/src/pages/ArtistPage.jsx` — perfil público de artista + grid de publicaciones asociadas
- [x] T064 Implementar página 404 limpia para slugs no encontrados

**Checkpoint [US3, US4]:** Se puede leer una entrevista completa. Galería de shows funciona con lightbox.

---

## Phase 9: Frontend — Formulario de contacto (US7)

- [x] T065 Crear `client/src/pages/ContactoPage.jsx` — formulario con React Hook Form + Zod
- [x] T066 Implementar validación client-side (nombre, email, mensaje requeridos; email formato válido)
- [x] T067 Integrar submit con `POST /api/contact`
- [x] T068 Mostrar mensaje de confirmación en éxito, error descriptivo en fallo
- [x] T069 Proteger contra doble submit (deshabilitar botón mientras `isSubmitting`)

**Checkpoint [US7]:** Formulario de contacto funciona end-to-end.

---

## Phase 10: Admin — Login y ProtectedRoute (US8)

- [x] T070 Crear `client/src/admin/pages/LoginPage.jsx` — formulario email + password, estética oscura con logo
- [x] T071 Integrar login con `POST /api/auth/login` → actualizar authStore
- [x] T072 Crear `client/src/components/admin/ProtectedRoute.jsx` — check `GET /api/auth/me`, redirect a `/admin/login` si 401
- [x] T073 Crear `client/src/components/admin/AdminLayout.jsx` — sidebar con links a secciones admin, logout

**Checkpoint [US8]:** Login funciona. Rutas admin protegidas. Sidebar navegable.

---

## Phase 11: Admin — CRUD Publicaciones (US9)

- [x] T074 Crear `client/src/admin/pages/PublicacionesPage.jsx` — tabla con filtro status, acciones por fila
- [x] T075 Crear `client/src/components/admin/PublicationEditor.jsx` — formulario completo con TipTapEditor, ImageUploader, CategorySelect, ArtistSelect
- [x] T076 Crear `client/src/components/admin/TipTapEditor.jsx` — editor enriquecido con toolbar (bold, italic, headings, links, image upload)
- [x] T077 Crear `client/src/components/admin/ImageUploader.jsx` — drag-and-drop o click, preview, llama POST /api/admin/upload
- [x] T078 Crear `client/src/admin/pages/NuevaPublicacionPage.jsx` + `EditarPublicacionPage.jsx`
- [x] T079 Implementar acciones: guardar borrador, publicar, despublicar, eliminar (con confirm dialog)
- [x] T080 Auto-generar slug desde título (editable)

**Checkpoint [US9]:** Administradora puede crear, editar y publicar entrevistas desde el panel.

---

## Phase 12: Admin — resto de secciones (US10–13) + Dashboard

En paralelo una vez que Phase 11 está completa:

- [x] T081 [P] Crear `client/src/admin/pages/DashboardPage.jsx` — tarjetas de resumen (publicaciones, borradores, episodios, contactos pendientes con badge rojo)
- [x] T082 [P] Crear `client/src/admin/pages/ArtistasPage.jsx` + `ArtistForm.jsx` — CRUD artistas con upload de foto (US10)
- [x] T083 [P] Crear `client/src/admin/pages/PodcastAdminPage.jsx` + formulario episodio — CRUD episodios (US11)
- [x] T084 [P] Crear `client/src/admin/pages/ShowsAdminPage.jsx` + formulario con upload múltiple de galería — CRUD shows (US12)
- [x] T085 [P] Crear `client/src/admin/pages/ContactoAdminPage.jsx` + `ContactDrawer.jsx` — bandeja con drawer lateral, marcar leída/archivar, link mailto (US13)

**Checkpoint [US10–13]:** Panel admin completo. Administradora puede gestionar todo el contenido.

---

## Phase 13: Detalles visuales y pulido

- [x] T086 [P] Implementar cursor personalizado (desktop only) — div fixed que sigue mouse, crece en hover sobre links
- [x] T087 [P] Aplicar efecto glitch CSS en logo de Navbar y títulos de sección grandes
- [x] T088 [P] Verificar textura de grano en hero y secciones oscuras (SVG overlay, 3-5% opacidad)
- [x] T089 [P] Verificar animaciones de entrada al viewport en todas las cards (stagger 100ms)
- [x] T090 [P] Verificar marquee del banner podcast (40s loop, sin saltos)
- [x] T091 Verificar transiciones de página con AnimatePresence (fade 200ms)
- [x] T092 Audit mobile: navbar mobile menu, lightbox swipe, formulario contacto, cards
- [x] T093 Verificar contraste de texto (mínimo AA) en todas las combinaciones de colores usadas

**Checkpoint:** Sitio con identidad visual completa. Animaciones sin jank.

---

## Phase 14: Deployment

- [ ] T094 Configurar VPS Hetzner — Ubuntu 22.04, instalar Node 20 via NVM, PostgreSQL 15, NGINX, PM2, Certbot
- [ ] T095 Crear usuario PostgreSQL `emergente_user` y base de datos `emergente_db`
- [ ] T096 Correr migraciones y seed en producción
- [ ] T097 Subir y configurar `nginx/emergente.conf` como se define en `plan.md`
- [ ] T098 Configurar Let's Encrypt SSL para `revistaemergente.ar` y `www.revistaemergente.ar`
- [ ] T099 Crear `.env` en el servidor con variables de producción
- [ ] T100 Build del frontend: `cd client && npm run build`
- [ ] T101 Rsync del build al VPS: `rsync -avz dist/ user@vps:/var/www/emergente/client/dist/`
- [ ] T102 Iniciar proceso con PM2: `pm2 start ecosystem.config.js --env production`
- [ ] T103 Verificar `https://revistaemergente.ar` — home carga, API responde, uploads funcionan
- [ ] T104 Verificar panel admin en producción — login, crear publicación, subir imagen

**Checkpoint final:** Sitio en vivo en `https://revistaemergente.ar`. Administradora puede gestionar contenido.

---

## Dependencias entre fases

| Fase                            | Depende de                            |
| ------------------------------- | ------------------------------------- |
| Phase 3 (Backend publicaciones) | Phase 1 (Setup)                       |
| Phase 4 (Backend resto)         | Phase 1 (Setup)                       |
| Phase 5 (Frontend base)         | Phase 1 (Setup)                       |
| Phase 6 (Home)                  | Phase 3 + Phase 5                     |
| Phase 7 (Listados)              | Phase 3 + Phase 4 + Phase 5           |
| Phase 8 (Detalle)               | Phase 7                               |
| Phase 9 (Contacto)              | Phase 4 (contacto endpoint) + Phase 5 |
| Phase 10 (Admin login)          | Phase 2 (Auth backend) + Phase 5      |
| Phase 11 (Admin CRUD)           | Phase 3 + Phase 10                    |
| Phase 12 (Admin resto)          | Phase 4 + Phase 10                    |
| Phase 13 (Pulido)               | Phase 12 (todo completo)              |
| Phase 14 (Deployment)           | Phase 13 (todo listo)                 |

### Oportunidades de paralelismo

Una vez completo Phase 1:

- Phase 2, 3, 4 pueden empezar en paralelo (son todos backend independientes)
- Phase 5 puede empezar en paralelo con el backend

Una vez completo Phase 5:

- Phase 6, 7, 9 pueden empezar en paralelo (páginas independientes)

Una vez completo Phase 10:

- Phase 11 y 12 pueden empezar en paralelo (admin sections independientes)

---

## Estrategia MVP

Si se necesita un MVP rápido para mostrar a la editora:

1. Phase 1 (Setup)
2. Phase 2 (Auth)
3. Phase 3 (Publicaciones backend)
4. Phase 5 (Frontend base)
5. Phase 6 (Home)
6. Phase 10 (Admin login)
7. Phase 11 (Admin CRUD publicaciones)

**Resultado:** Sitio con home funcional + panel para crear y publicar entrevistas. El resto se agrega iterativamente.
