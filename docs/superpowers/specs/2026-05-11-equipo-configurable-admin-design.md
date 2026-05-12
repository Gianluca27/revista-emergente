# Configurar "El Equipo" desde el panel de administración

**Fecha:** 2026-05-11
**Estado:** Diseño aprobado — listo para plan de implementación

## Problema

La sección "El Equipo" de la página pública `Sobre Nosotros` (`client/src/pages/SobreNosotrosPage.jsx`) tiene los miembros del equipo hardcodeados en un array `team`. Para cambiar un nombre, rol, bio o foto hay que editar código y redeployar. Se quiere gestionarlos desde el panel de administración existente.

## Alcance

**Incluido:** CRUD de miembros del equipo (nombre, rol, bio, foto) + reordenamiento por drag & drop, expuesto en el admin; la página pública lee los datos de la API.

**Fuera de alcance:** el resto de `SobreNosotrosPage` (manifiesto, bloques "¿Qué es Emergente?", textos del hero y CTA) queda hardcodeado. Si más adelante se quiere hacer toda la página content-managed, será otro spec.

## Decisiones de diseño

- **Tabla dedicada `team_members`** (no un blob JSON en una tabla settings, no reutilizar `artists`). Calca el patrón ya usado por `artists` / `shows`: modelo + controller + rutas.
- **Foto por miembro**, subida con el flujo de upload existente (`POST /api/admin/upload`, componente `ImageUploader`). Reemplaza el cuadro gris placeholder actual; si un miembro no tiene foto, se mantiene el cuadro gris.
- **Orden por drag & drop** en el admin, persistido en una columna `position` (entero). El drag usa `Reorder` de `framer-motion` (ya es dependencia, ya se usa en `GalleryUploader`) — cero dependencias nuevas.
- **Seed de migración** con los 3 miembros actualmente hardcodeados, para que la página no quede vacía tras el deploy.

## Arquitectura

### Backend (`server/`)

**Migración** `server/migrations/004_team_members.sql` — idempotente, mismo estilo que las migraciones existentes (`IF NOT EXISTS`, guard contra doble seed):

```sql
CREATE TABLE IF NOT EXISTS team_members (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(255),
  bio         TEXT,
  photo       VARCHAR(500),
  position    INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_team_members_position ON team_members(position);
-- Seed: los 3 miembros hardcodeados actuales (Valentina Herrera, Lucas Pereyra,
-- Mar Domínguez) con position 0,1,2 — solo si la tabla está vacía.
```

**Modelo** `server/src/models/teamMembers.js`:
- `getAll()` — `SELECT ... ORDER BY position ASC, id ASC`
- `getById(id)`
- `create({ name, role, bio, photo })` — `position = (SELECT COALESCE(MAX(position), -1) + 1 FROM team_members)`; devuelve `{ id }`
- `update(id, fields)` — patrón dinámico de set-clauses (igual que `artists.update`), solo actualiza campos `!== undefined`
- `remove(id)` — `DELETE`
- `reorder(orderedIds)` — en una transacción, `UPDATE team_members SET position = $idx WHERE id = $id` para cada id según su índice en el array

**Controller** `server/src/controllers/teamMembersController.js`:
- `listPublic(req, res)` — devuelve `getAll()`
- `getOneAdmin(req, res)` — `getById`, 404 si no existe
- `createOne(req, res)` — valida `name` requerido (422 si falta), crea, devuelve 201 con `{ id }`
- `updateOne(req, res)` — valida que exista (404), actualiza, devuelve el row
- `deleteOne(req, res)` — `remove`, 204
- `reorderAll(req, res)` — valida `req.body.ids` array de enteros (400 si inválido), llama `reorder`, devuelve `getAll()`

Errores: try/catch con `console.error('[teamMembersController] ...')` y 500, igual que los controllers existentes.

**Rutas** `server/src/routes/team.routes.js`, montado en `server/src/app.js` con `app.use('/api', teamRoutes)`:

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/team` | pública | lista ordenada |
| GET | `/api/admin/team/:id` | `requireAuth` | un miembro |
| POST | `/api/admin/team` | `requireAuth` | crear |
| PUT | `/api/admin/team/:id` | `requireAuth` | actualizar |
| DELETE | `/api/admin/team/:id` | `requireAuth` | borrar |
| PATCH | `/api/admin/team/reorder` | `requireAuth` | body `{ ids: [3,1,2] }` |

Nota: `/api/admin/team/reorder` debe declararse **antes** que `/api/admin/team/:id` para que `reorder` no matchee como `:id`.

### Frontend admin (`client/src/`)

**`admin/pages/EquipoAdminPage.jsx`** — lista de miembros con `Reorder.Group` (`axis="y"`). Cada fila (`Reorder.Item`): thumbnail de la foto (o cuadro gris si no hay), nombre, rol, botones Editar y Borrar, cursor de arrastre. `onReorder` actualiza el estado local de inmediato (optimista) y dispara `reorderTeamMembers(ids)`; si falla, revierte y muestra error. Botón "+ Nuevo miembro". Confirmación antes de borrar. El patrón concreto (modal vs. página `/admin/equipo/nuevo` + `/admin/equipo/:id`) se decide copiando el de `ArtistasPage` para mantener consistencia — se resolverá en el plan tras inspeccionar ese archivo.

**`components/admin/TeamMemberForm.jsx`** — `react-hook-form` + `zod` + `ImageUploader`, mismo molde que `ArtistForm`. Campos: `name` (requerido), `role` (texto), `bio` (textarea), `photo` (`ImageUploader`).

**`components/admin/AdminLayout.jsx`** — agregar al array `NAV`: `{ label: 'Equipo', path: '/admin/equipo', mark: '◐' }` (símbolo libre, no usado por otros ítems).

**`App.jsx`** — rutas nuevas dentro de `ProtectedRoute` / `AdminLayout`: `/admin/equipo` (+ las de form si se usan páginas en vez de modal).

**`services/`** (en `services/publications.js` junto al resto, o un nuevo `services/team.js` — a decidir en el plan):
- `getTeamMembers()` → `GET /team`
- `getTeamMember(id)` → `GET /admin/team/:id`
- `createTeamMember(data)` → `POST /admin/team`
- `updateTeamMember(id, data)` → `PUT /admin/team/:id`
- `deleteTeamMember(id)` → `DELETE /admin/team/:id`
- `reorderTeamMembers(ids)` → `PATCH /admin/team/reorder`

### Frontend público (`client/src/`)

**`pages/SobreNosotrosPage.jsx`** — eliminar el array hardcodeado `team`. Agregar `useState` + `useEffect` que llama `getTeamMembers()`. El render de la sección "El Equipo" queda visualmente idéntico, con dos cambios:
- El `<div className="aspect-square w-full bg-gris" />` se reemplaza por `<img src={UPLOAD_URL + member.photo} ... />` cuando `member.photo` existe; si no, se mantiene el cuadro gris (constante `UPLOAD_URL` derivada de `import.meta.env.VITE_API_URL` como en `ImageUploader`).
- Si la lista viene vacía, se oculta toda la sección "El Equipo".
- Mientras carga, no se renderiza la sección (el resto de la página es estático y aparece igual).

Manifiesto, "¿Qué es Emergente?", hero y CTA se dejan tal cual.

## Flujo de datos

```
Admin abre /admin/equipo
  → GET /api/team → lista ordenada por position
Admin crea/edita miembro (sube foto vía POST /api/admin/upload → url)
  → POST/PUT /api/admin/team → persiste
Admin arrastra para reordenar
  → estado local optimista → PATCH /api/admin/team/reorder { ids }
Visitante abre /sobre-nosotros
  → GET /api/team → render de las cards (foto o cuadro gris)
```

## Manejo de errores y casos borde

- Equipo vacío → la sección "El Equipo" no se renderiza en público.
- Miembro sin foto → cuadro gris (comportamiento actual).
- `name` vacío al crear/editar → 422 backend + validación zod en el form.
- `reorder` con array inválido o ids inexistentes → 400; el front revierte el orden optimista.
- Endpoints `/admin/*` sin sesión → 401 (interceptor de `api.js` redirige a `/admin/login`).
- Migración corre dos veces → `IF NOT EXISTS` + guard de seed evitan duplicados.

## Testing

- `server`: `node --test`. Agregar tests del modelo `teamMembers` (al menos `create` asigna `position` incremental, `reorder` reasigna posiciones). Si no existe setup de base de datos de test reutilizable, el plan lo señala y se acota a lo viable (p. ej. test de validación del controller con el modelo mockeado, en línea con lo que ya exista).
- Verificación manual: crear/editar/borrar/reordenar miembros en el admin y comprobar que `/sobre-nosotros` refleja los cambios, con y sin foto.

## Archivos afectados

Nuevos:
- `server/migrations/004_team_members.sql`
- `server/src/models/teamMembers.js`
- `server/src/controllers/teamMembersController.js`
- `server/src/routes/team.routes.js`
- `client/src/admin/pages/EquipoAdminPage.jsx`
- `client/src/components/admin/TeamMemberForm.jsx`
- (posible) `client/src/services/team.js`
- (posible) tests en `server/src/...`

Modificados:
- `server/src/app.js` (montar rutas)
- `client/src/components/admin/AdminLayout.jsx` (ítem de nav)
- `client/src/App.jsx` (rutas admin)
- `client/src/pages/SobreNosotrosPage.jsx` (fetch en vez de array)
- `client/src/services/publications.js` (si los helpers van ahí en vez de `team.js`)
