# Equipo Configurable desde Admin — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el array hardcodeado `team` de `SobreNosotrosPage.jsx` por un CRUD de miembros del equipo (nombre, rol, bio, foto, orden drag&drop) gestionable desde el panel de administración.

**Architecture:** Tabla nueva `team_members` en PostgreSQL (patrón idéntico a `artists`/`shows`): migración + modelo + controller + rutas Express. Front admin: página de lista con reordenamiento por arrastre (`Reorder` de `framer-motion`, ya es dependencia) + formulario reutilizando `ImageUploader`. Front público: `SobreNosotrosPage` deja de tener datos estáticos y consume `GET /api/team`.

**Tech Stack:** Node 20 + Express + `pg` (backend); React 19 + Vite + `react-hook-form` + `zod` + `framer-motion` + `axios` (frontend). Tests: `node --test` contra una base PostgreSQL real (`DATABASE_URL` del `.env` del server).

**Convenciones del repo a respetar:**
- Controllers: `try/catch`, `console.error('[xxxController] ...')`, `res.status(500).json({ error: 'Error interno del servidor' })`.
- Modelos: importan `pool` de `../services/db.js`; `update` con set-clauses dinámicos solo para campos `!== undefined`.
- Rutas admin protegidas con `requireAuth` de `../middleware/authMiddleware.js`, montadas con `app.use('/api', xxxRoutes)`.
- Migraciones: numeradas `NNN_nombre.sql`, idempotentes (`IF NOT EXISTS`), corren solas vía `runMigrations` al arrancar el server.
- Front admin: páginas en `client/src/admin/pages/`, componentes en `client/src/components/admin/`. El admin usa `api` (axios) directamente; el sitio público usa helpers de `client/src/services/publications.js`.
- Estilos: clases Tailwind del proyecto (`bg-crema`, `text-rojo`, `font-display`, `font-ui`, `font-mono`, `border-gris-mid`, etc.).

---

## File Structure

**Nuevos:**
- `server/migrations/004_team_members.sql` — tabla `team_members` + seed con los 3 miembros actuales.
- `server/src/models/teamMembers.js` — acceso a datos: `getAll`, `getById`, `create`, `update`, `remove`, `reorder`.
- `server/src/models/teamMembers.test.js` — test de integración del modelo contra la DB.
- `server/src/controllers/teamMembersController.js` — `listPublic`, `getOneAdmin`, `createOne`, `updateOne`, `deleteOne`, `reorderAll`.
- `server/src/routes/team.routes.js` — rutas pública + admin.
- `client/src/components/admin/TeamMemberForm.jsx` — formulario crear/editar miembro.
- `client/src/admin/pages/EquipoAdminPage.jsx` — lista + reorder + alta/edición/baja.

**Modificados:**
- `server/src/app.js` — montar `teamRoutes`.
- `client/src/services/publications.js` — agregar `getTeamMembers()`.
- `client/src/components/admin/AdminLayout.jsx` — ítem de nav "Equipo".
- `client/src/App.jsx` — ruta `/admin/equipo`.
- `client/src/pages/SobreNosotrosPage.jsx` — fetch en vez de array estático; render de foto.

---

## Task 1: Migración `004_team_members.sql`

**Files:**
- Create: `server/migrations/004_team_members.sql`

- [ ] **Step 1: Escribir la migración**

Crear `server/migrations/004_team_members.sql` con exactamente este contenido:

```sql
-- Revista Emergente — tabla de miembros del equipo (sección "El Equipo" de Sobre Nosotros)

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

-- Seed: los 3 miembros hardcodeados actuales en SobreNosotrosPage.jsx.
-- Solo si la tabla está vacía (doble seguridad; la migración ya está trackeada en schema_migrations).
INSERT INTO team_members (name, role, bio, position)
SELECT v.name, v.role, v.bio, v.position
FROM (VALUES
  ('VALENTINA HERRERA', 'Directora & Editora', 'Periodista musical con 8 años cubriendo el under porteño', 0),
  ('LUCAS PEREYRA',     'Fotografía',          'Documentando shows desde el fondo del pozo desde 2019',     1),
  ('MAR DOMÍNGUEZ',     'Multimedia & Redes',  'Productora de audio, DJ, cronista del caos organizado',     2)
) AS v(name, role, bio, position)
WHERE NOT EXISTS (SELECT 1 FROM team_members);
```

- [ ] **Step 2: Correr migraciones para verificar**

Run: `cd server && node -e "import('./src/services/db.js').then(async ({default:pool})=>{const {runMigrations}=await import('./src/services/migrate.js');await runMigrations(pool);const r=await pool.query('SELECT name, position FROM team_members ORDER BY position');console.log(r.rows);await pool.end();})"`

Expected: imprime `[ { name: 'VALENTINA HERRERA', position: 0 }, { name: 'LUCAS PEREYRA', position: 1 }, { name: 'MAR DOMÍNGUEZ', position: 2 } ]` y termina sin error. (Si la tabla ya existía de una corrida previa, basta con que el comando termine sin error y muestre filas.)

- [ ] **Step 3: Commit**

```bash
git add server/migrations/004_team_members.sql
git commit -m "feat(db): add team_members table with seed of current team"
```

---

## Task 2: Modelo `teamMembers.js` (con test de integración)

**Files:**
- Create: `server/src/models/teamMembers.js`
- Test: `server/src/models/teamMembers.test.js`

- [ ] **Step 1: Escribir el test que falla**

Crear `server/src/models/teamMembers.test.js`:

```js
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.join(fileURLToPath(new URL('../..', import.meta.url)), '.env') });

const PREFIX = '__test_team_';
let pool;
let Team;

before(async () => {
  Team = await import('./teamMembers.js');
  pool = (await import('../services/db.js')).default;
  // La tabla puede no existir si las migraciones no corrieron en este contexto.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, role VARCHAR(255),
      bio TEXT, photo VARCHAR(500), position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  await pool.query('DELETE FROM team_members WHERE name LIKE $1', [PREFIX + '%']);
});

after(async () => {
  if (pool) {
    await pool.query('DELETE FROM team_members WHERE name LIKE $1', [PREFIX + '%']);
    await pool.end();
  }
});

// Estos tests comparten estado y corren en orden (mismo patrón que migrate.test.js).
test('create() devuelve el row y asigna position incremental', async () => {
  const a = await Team.create({ name: PREFIX + 'A' });
  const b = await Team.create({ name: PREFIX + 'B', role: 'Rol B', bio: 'Bio B' });
  assert.equal(typeof a.id, 'number');
  assert.equal(b.name, PREFIX + 'B');
  assert.ok(b.position > a.position, 'el segundo miembro recibe un position mayor');
});

test('getAll() devuelve los miembros ordenados por position', async () => {
  const ours = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX));
  assert.deepEqual(ours.map(m => m.name), [PREFIX + 'A', PREFIX + 'B']);
});

test('reorder() reasigna position según el orden de ids recibido', async () => {
  const ours = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX));
  const [a, b] = ours; // A position menor, B position mayor
  await Team.reorder([b.id, a.id]);
  const reordered = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX));
  assert.deepEqual(reordered.map(m => m.name), [PREFIX + 'B', PREFIX + 'A']);
});

test('update() cambia solo los campos provistos', async () => {
  const target = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX))[0];
  const updated = await Team.update(target.id, { role: 'Tester' });
  assert.equal(updated.role, 'Tester');
  assert.equal(updated.name, target.name); // name intacto
});

test('remove() elimina el miembro', async () => {
  const target = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX))[0];
  await Team.remove(target.id);
  const still = (await Team.getAll()).filter(m => m.id === target.id);
  assert.equal(still.length, 0);
});
```

- [ ] **Step 2: Correr el test para verificar que falla**

Run: `cd server && node --test src/models/teamMembers.test.js`
Expected: FALLA al importar `./teamMembers.js` (`Cannot find module '.../teamMembers.js'`).

- [ ] **Step 3: Implementar el modelo**

Crear `server/src/models/teamMembers.js`:

```js
import pool from '../services/db.js';

const COLS = 'id, name, role, bio, photo, position';

export async function getAll() {
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM team_members ORDER BY position ASC, id ASC`
  );
  return rows;
}

export async function getById(id) {
  const { rows } = await pool.query(
    `SELECT ${COLS} FROM team_members WHERE id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function create({ name, role, bio, photo }) {
  const { rows } = await pool.query(
    `INSERT INTO team_members (name, role, bio, photo, position)
     VALUES ($1, $2, $3, $4, (SELECT COALESCE(MAX(position), -1) + 1 FROM team_members))
     RETURNING ${COLS}`,
    [name, role ?? null, bio ?? null, photo ?? null]
  );
  return rows[0];
}

export async function update(id, fields) {
  const { name, role, bio, photo } = fields;
  const setClauses = [];
  const values = [];
  if (name  !== undefined) { values.push(name);  setClauses.push(`name = $${values.length}`); }
  if (role  !== undefined) { values.push(role);  setClauses.push(`role = $${values.length}`); }
  if (bio   !== undefined) { values.push(bio);   setClauses.push(`bio = $${values.length}`); }
  if (photo !== undefined) { values.push(photo); setClauses.push(`photo = $${values.length}`); }

  if (setClauses.length) {
    values.push(id);
    await pool.query(
      `UPDATE team_members SET ${setClauses.join(', ')} WHERE id = $${values.length}`,
      values
    );
  }
  return getById(id);
}

export async function remove(id) {
  await pool.query('DELETE FROM team_members WHERE id = $1', [id]);
}

export async function reorder(orderedIds) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (let i = 0; i < orderedIds.length; i++) {
      await client.query('UPDATE team_members SET position = $1 WHERE id = $2', [i, orderedIds[i]]);
    }
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
```

- [ ] **Step 4: Correr el test para verificar que pasa**

Run: `cd server && node --test src/models/teamMembers.test.js`
Expected: PASS (5 tests pasan, proceso termina solo).

- [ ] **Step 5: Correr toda la suite del server**

Run: `cd server && npm test`
Expected: pasan tanto `migrate.test.js` como `teamMembers.test.js`.

- [ ] **Step 6: Commit**

```bash
git add server/src/models/teamMembers.js server/src/models/teamMembers.test.js
git commit -m "feat(api): team_members model with reorder + integration test"
```

---

## Task 3: Controller `teamMembersController.js`

(Glue fino sobre el modelo, mismo estilo que `artistsController.js`, que no tiene test automatizado; se cubre con el smoke test de la Task 4.)

**Files:**
- Create: `server/src/controllers/teamMembersController.js`

- [ ] **Step 1: Implementar el controller**

Crear `server/src/controllers/teamMembersController.js`:

```js
import * as Team from '../models/teamMembers.js';

// ── Público ─────────────────────────────────────
export async function listPublic(req, res) {
  try {
    const data = await Team.getAll();
    res.json(data);
  } catch (err) {
    console.error('[teamMembersController] listPublic error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

// ── Admin (protegidas por authMiddleware) ───────
export async function getOneAdmin(req, res) {
  try {
    const id = Number(req.params.id);
    const member = await Team.getById(id);
    if (!member) return res.status(404).json({ error: 'Miembro no encontrado' });
    res.json(member);
  } catch (err) {
    console.error('[teamMembersController] getOneAdmin error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function createOne(req, res) {
  try {
    const { name, role, bio, photo } = req.body;
    if (!name) return res.status(422).json({ error: 'El nombre es requerido' });
    const member = await Team.create({ name, role, bio, photo });
    res.status(201).json(member);
  } catch (err) {
    console.error('[teamMembersController] createOne error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function updateOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Team.getById(id);
    if (!existing) return res.status(404).json({ error: 'Miembro no encontrado' });
    if (req.body.name !== undefined && !req.body.name) {
      return res.status(422).json({ error: 'El nombre es requerido' });
    }
    const updated = await Team.update(id, req.body);
    res.json(updated);
  } catch (err) {
    console.error('[teamMembersController] updateOne error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function deleteOne(req, res) {
  try {
    const id = Number(req.params.id);
    const existing = await Team.getById(id);
    if (!existing) return res.status(404).json({ error: 'Miembro no encontrado' });
    await Team.remove(id);
    res.json({ message: 'Miembro eliminado' });
  } catch (err) {
    console.error('[teamMembersController] deleteOne error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}

export async function reorderAll(req, res) {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0 || !ids.every(n => Number.isInteger(n))) {
      return res.status(400).json({ error: 'ids debe ser un array de enteros' });
    }
    await Team.reorder(ids);
    const data = await Team.getAll();
    res.json(data);
  } catch (err) {
    console.error('[teamMembersController] reorderAll error:', err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/controllers/teamMembersController.js
git commit -m "feat(api): team_members controller"
```

---

## Task 4: Rutas `team.routes.js` + montar en `app.js`

**Files:**
- Create: `server/src/routes/team.routes.js`
- Modify: `server/src/app.js`

- [ ] **Step 1: Crear el archivo de rutas**

Crear `server/src/routes/team.routes.js`:

```js
import { Router } from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  listPublic, getOneAdmin, createOne, updateOne, deleteOne, reorderAll,
} from '../controllers/teamMembersController.js';

const router = Router();

// Público
router.get('/team', listPublic);

// Admin — '/admin/team/reorder' DEBE ir antes de '/admin/team/:id'
router.patch('/admin/team/reorder', requireAuth, reorderAll);
router.get('/admin/team/:id', requireAuth, getOneAdmin);
router.post('/admin/team', requireAuth, createOne);
router.put('/admin/team/:id', requireAuth, updateOne);
router.delete('/admin/team/:id', requireAuth, deleteOne);

export default router;
```

- [ ] **Step 2: Montar las rutas en `server/src/app.js`**

En `server/src/app.js`, junto a los otros imports de rutas, agregar:

```js
import teamRoutes from './routes/team.routes.js';
```

Y junto a los otros `app.use('/api', ...)`, agregar (después de `app.use('/api', artistsRoutes);`):

```js
app.use('/api', teamRoutes);
```

- [ ] **Step 3: Smoke test del endpoint público**

Levantar el server: `cd server && npm start` (en otra terminal o background). Luego:

Run: `curl -s http://localhost:3001/api/team`
Expected: JSON array con los 3 miembros sembrados, p. ej. `[{"id":1,"name":"VALENTINA HERRERA","role":"Directora & Editora","bio":"...","photo":null,"position":0}, ...]`.

Run: `curl -s -o /dev/null -w "%{http_code}\n" -X POST http://localhost:3001/api/admin/team -H "Content-Type: application/json" -d '{}'`
Expected: `401` (sin sesión admin → rechazado por `requireAuth`).

Detener el server.

- [ ] **Step 4: Commit**

```bash
git add server/src/routes/team.routes.js server/src/app.js
git commit -m "feat(api): mount /api/team routes"
```

---

## Task 5: Helper de API para el sitio público

**Files:**
- Modify: `client/src/services/publications.js`

- [ ] **Step 1: Agregar el helper**

En `client/src/services/publications.js`, al final del archivo, agregar:

```js
export const getTeamMembers = () =>
  api.get('/team').then(r => r.data)
```

(El admin no necesita helpers nuevos: `EquipoAdminPage` usa `api` directamente, igual que `ArtistasPage`.)

- [ ] **Step 2: Verificar que el build no rompe**

Run: `cd client && npm run build`
Expected: build OK (sin errores de import/sintaxis).

- [ ] **Step 3: Commit**

```bash
git add client/src/services/publications.js
git commit -m "feat(client): getTeamMembers API helper"
```

---

## Task 6: Componente `TeamMemberForm.jsx`

**Files:**
- Create: `client/src/components/admin/TeamMemberForm.jsx`

Basado en `client/src/components/admin/ArtistForm.jsx` (mismo patrón `react-hook-form` + `zod` + `ImageUploader` + bloque de acciones con confirmación de borrado), simplificado a 4 campos.

- [ ] **Step 1: Crear el componente**

Crear `client/src/components/admin/TeamMemberForm.jsx`:

```jsx
import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import ImageUploader from './ImageUploader'

const schema = z.object({
  name:  z.string().min(1, 'El nombre es requerido'),
  role:  z.string().optional(),
  bio:   z.string().optional(),
  photo: z.string().optional(),
})

const INPUT_CLS = 'w-full bg-crema text-negro font-mono text-sm px-3 py-2.5 border border-gris-mid focus:outline-none focus:border-rojo/60 transition-colors duration-150 placeholder-gris-mid'
const INPUT_ERR = 'border-rojo'

function FieldLabel({ children, required }) {
  return (
    <label className="block font-ui text-[10px] uppercase tracking-[0.25em] text-negro/90 mb-1.5">
      {children}{required && <span className="text-rojo ml-0.5">*</span>}
    </label>
  )
}

function FieldError({ message }) {
  return message ? <p className="font-mono text-[10px] text-rojo mt-1">{message}</p> : null
}

export default function TeamMemberForm({ initialData, onSubmit, onDelete, saving }) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name:  initialData?.name  ?? '',
      role:  initialData?.role  ?? '',
      bio:   initialData?.bio   ?? '',
      photo: initialData?.photo ?? '',
    },
  })

  function buildPayload(data) {
    return {
      name:  data.name,
      role:  data.role  || null,
      bio:   data.bio   || null,
      photo: data.photo || null,
    }
  }

  const submit = handleSubmit(data => onSubmit(buildPayload(data)))

  return (
    <form onSubmit={submit} className="space-y-7">
      {/* Nombre */}
      <div>
        <FieldLabel required>Nombre</FieldLabel>
        <input
          {...register('name')}
          placeholder="Nombre y apellido"
          className={`${INPUT_CLS} font-display text-xl tracking-wide ${errors.name ? INPUT_ERR : ''}`}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* Foto */}
      <Controller
        name="photo"
        control={control}
        render={({ field }) => (
          <ImageUploader value={field.value} onChange={field.onChange} label="Foto" />
        )}
      />

      {/* Rol */}
      <div>
        <FieldLabel>Rol</FieldLabel>
        <input
          {...register('role')}
          placeholder="Ej: Directora & Editora"
          className={INPUT_CLS}
        />
      </div>

      {/* Bio */}
      <div>
        <FieldLabel>Bio</FieldLabel>
        <textarea
          {...register('bio')}
          placeholder="Una línea sobre la persona"
          rows={4}
          className={`${INPUT_CLS} resize-y leading-relaxed`}
        />
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gris-mid">
        <motion.button
          type="submit"
          disabled={saving}
          whileTap={{ scale: 0.97 }}
          className="px-5 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150 disabled:opacity-40"
        >
          {saving ? 'Guardando…' : initialData ? 'Actualizar' : 'Crear'}
        </motion.button>

        {onDelete && (
          <div className="ml-auto">
            <AnimatePresence mode="wait">
              {!confirmDelete ? (
                <motion.button
                  key="del"
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="font-ui text-[10px] uppercase tracking-[0.2em] text-negro/90 hover:text-rojo transition-colors duration-150"
                >
                  Eliminar
                </motion.button>
              ) : (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <span className="font-mono text-[10px] text-rojo">¿Confirmar?</span>
                  <button
                    type="button"
                    onClick={onDelete}
                    className="font-ui text-[10px] uppercase tracking-widest px-2.5 py-1 bg-rojo text-crema"
                  >Sí, eliminar</button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="font-mono text-[10px] text-negro/90 hover:text-negro"
                  >No</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </form>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `cd client && npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add client/src/components/admin/TeamMemberForm.jsx
git commit -m "feat(client): TeamMemberForm component"
```

---

## Task 7: Página admin `EquipoAdminPage.jsx`

**Files:**
- Create: `client/src/admin/pages/EquipoAdminPage.jsx`

Basada en `client/src/admin/pages/ArtistasPage.jsx` (mismo esquema list-mode / form-mode con `flash` y `error`), con dos diferencias: la lista usa `Reorder.Group`/`Reorder.Item` de `framer-motion` para arrastrar, y al soltar persiste el orden con `PATCH /admin/team/reorder` (optimista, revierte si falla).

- [ ] **Step 1: Crear la página**

Crear `client/src/admin/pages/EquipoAdminPage.jsx`:

```jsx
import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import api from '../../services/api'
import TeamMemberForm from '../../components/admin/TeamMemberForm'

const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace('/api', '')
  : 'http://localhost:3001'

function resolvePhoto(photo) {
  if (!photo) return null
  return photo.startsWith('http') ? photo : UPLOAD_URL + photo
}

function MemberThumb({ photo, name }) {
  const src = resolvePhoto(photo)
  return src ? (
    <img src={src} alt={name} className="w-12 h-12 object-cover border border-gris-mid" />
  ) : (
    <div className="w-12 h-12 flex items-center justify-center bg-gris border border-gris-mid font-display text-lg text-negro/90">
      {name?.[0]?.toUpperCase() ?? '?'}
    </div>
  )
}

export default function EquipoAdminPage() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [creating, setCreating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [flash, setFlash] = useState(null)

  const fetchMembers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get('/team')
      setMembers(res.data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchMembers() }, [fetchMembers])

  function flashMsg(msg) {
    setFlash(msg)
    setTimeout(() => setFlash(null), 2500)
  }

  async function openEdit(member) {
    setError(null)
    try {
      const res = await api.get(`/admin/team/${member.id}`)
      setEditing(res.data)
      setCreating(false)
    } catch (err) {
      setError(err.response?.data?.error || 'Error al cargar el miembro')
    }
  }

  async function handleCreate(payload) {
    setError(null); setSaving(true)
    try {
      await api.post('/admin/team', payload)
      setCreating(false)
      flashMsg('Miembro creado')
      await fetchMembers()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear')
    } finally { setSaving(false) }
  }

  async function handleUpdate(payload) {
    if (!editing) return
    setError(null); setSaving(true)
    try {
      await api.put(`/admin/team/${editing.id}`, payload)
      setEditing(null)
      flashMsg('Miembro actualizado')
      await fetchMembers()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al actualizar')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!editing) return
    setError(null)
    try {
      await api.delete(`/admin/team/${editing.id}`)
      setEditing(null)
      flashMsg('Miembro eliminado')
      await fetchMembers()
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar')
    }
  }

  async function handleReorder(next) {
    const prev = members
    setMembers(next) // optimista
    try {
      await api.patch('/admin/team/reorder', { ids: next.map(m => m.id) })
    } catch (err) {
      setMembers(prev) // revertir
      setError(err.response?.data?.error || 'Error al reordenar')
    }
  }

  const showForm = creating || editing

  return (
    <div className="px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <h1 className="font-display text-5xl text-negro tracking-wide leading-none">EQUIPO</h1>
          <p className="font-mono text-[11px] text-negro/90 mt-1">{members.length} miembros</p>
        </div>
        {!showForm && (
          <button
            onClick={() => { setCreating(true); setEditing(null); setError(null) }}
            className="px-4 py-2.5 bg-rojo font-ui text-[11px] uppercase tracking-[0.25em] text-crema hover:bg-rojo-osc transition-colors duration-150"
          >
            + Nuevo miembro
          </button>
        )}
      </div>

      <AnimatePresence>
        {flash && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="border border-gris-mid px-4 py-3 mb-6"
          >
            <p className="font-mono text-[11px] text-negro">{flash}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border border-rojo bg-rojo/10 px-4 py-3 mb-6"
        >
          <p className="font-mono text-[11px] text-rojo">{error}</p>
        </motion.div>
      )}

      {showForm ? (
        <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-6">
            <p className="font-ui text-[10px] uppercase tracking-[0.25em] text-negro/90">
              {creating ? 'Nuevo miembro' : `Editando: ${editing.name}`}
            </p>
            <button
              onClick={() => { setEditing(null); setCreating(false); setError(null) }}
              className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
            >
              ← Volver al listado
            </button>
          </div>

          <TeamMemberForm
            initialData={editing}
            onSubmit={creating ? handleCreate : handleUpdate}
            onDelete={editing ? handleDelete : null}
            saving={saving}
          />
        </div>
      ) : (
        <div className="border border-gris-mid">
          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <motion.span
                animate={{ opacity: [0.15, 0.7, 0.15] }}
                transition={{ duration: 1.6, repeat: Infinity }}
                className="font-display text-5xl text-negro/90 tracking-widest"
              >RE</motion.span>
            </div>
          ) : members.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-mono text-[12px] text-negro/90 mb-3">Sin miembros cargados</p>
              <button
                onClick={() => setCreating(true)}
                className="font-ui text-[10px] uppercase tracking-[0.25em] text-rojo hover:underline"
              >
                + Cargar el primero
              </button>
            </div>
          ) : (
            <>
              <Reorder.Group axis="y" values={members} onReorder={handleReorder}>
                {members.map((m) => (
                  <Reorder.Item
                    key={m.id}
                    value={m}
                    className="flex items-center gap-4 px-4 py-3.5 border-b border-gris-mid/50 last:border-0 bg-crema hover:bg-gris/50 transition-colors duration-100 cursor-grab active:cursor-grabbing"
                  >
                    <span className="font-mono text-[10px] text-negro/40 select-none">⠿</span>
                    <MemberThumb photo={m.photo} name={m.name} />
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[12px] text-negro truncate">{m.name}</p>
                      {m.role && <p className="font-mono text-[10px] text-negro/90 truncate">{m.role}</p>}
                    </div>
                    <button
                      onClick={() => openEdit(m)}
                      className="font-ui text-[10px] uppercase tracking-widest text-negro/90 hover:text-negro transition-colors"
                    >
                      Editar →
                    </button>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
              <p className="font-mono text-[9px] text-negro/90 px-4 py-2 border-t border-gris-mid">
                Arrastrá las filas para reordenar el equipo
              </p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Verificar build**

Run: `cd client && npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add client/src/admin/pages/EquipoAdminPage.jsx
git commit -m "feat(client): EquipoAdminPage with drag-to-reorder"
```

---

## Task 8: Cablear ruta y nav del admin

**Files:**
- Modify: `client/src/App.jsx`
- Modify: `client/src/components/admin/AdminLayout.jsx`

- [ ] **Step 1: Agregar el import y la ruta en `client/src/App.jsx`**

Junto a los otros imports de páginas admin, agregar:

```jsx
import EquipoAdminPage from './admin/pages/EquipoAdminPage'
```

Dentro del bloque `<Route element={<AdminLayout />}>`, después de `<Route path="artistas" element={<ArtistasPage />} />`, agregar:

```jsx
<Route path="equipo" element={<EquipoAdminPage />} />
```

- [ ] **Step 2: Agregar el ítem de nav en `client/src/components/admin/AdminLayout.jsx`**

En el array `NAV`, después de la entrada de `Artistas`, agregar:

```js
{ label: 'Equipo',        path: '/admin/equipo',        mark: '◐' },
```

(Resultado del array `NAV`:)

```js
const NAV = [
  { label: 'Dashboard',     path: '/admin/dashboard',     mark: '◆' },
  { label: 'Publicaciones', path: '/admin/publicaciones', mark: '▬' },
  { label: 'Artistas',      path: '/admin/artistas',      mark: '◈' },
  { label: 'Equipo',        path: '/admin/equipo',        mark: '◐' },
  { label: 'Shows',         path: '/admin/shows',         mark: '◎' },
  { label: 'Mensajes',      path: '/admin/contacto',      mark: '◻' },
]
```

- [ ] **Step 3: Verificar build**

Run: `cd client && npm run build`
Expected: build OK.

- [ ] **Step 4: Commit**

```bash
git add client/src/App.jsx client/src/components/admin/AdminLayout.jsx
git commit -m "feat(client): wire /admin/equipo route and nav entry"
```

---

## Task 9: Página pública `SobreNosotrosPage.jsx` consume la API

**Files:**
- Modify: `client/src/pages/SobreNosotrosPage.jsx`

- [ ] **Step 1: Reemplazar datos estáticos por fetch**

En `client/src/pages/SobreNosotrosPage.jsx`:

1. Cambiar la primera línea de imports para incluir hooks de React y el helper:

```jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { getTeamMembers } from "../services/publications";
```

2. Después de los imports, agregar la constante de URL de uploads (espejo de `ImageUploader.jsx`):

```jsx
const UPLOAD_URL = import.meta.env.VITE_API_URL
  ? import.meta.env.VITE_API_URL.replace("/api", "")
  : "http://localhost:3001";
```

3. **Eliminar** por completo la constante `const team = [ ... ];` (las ~16 líneas del array hardcodeado de miembros). `features` y `manifesto` quedan tal cual.

4. Dentro de `export default function SobreNosotrosPage()`, antes del `return`, agregar el estado y el efecto:

```jsx
  const [team, setTeam] = useState(null); // null = cargando; [] = vacío

  useEffect(() => {
    getTeamMembers()
      .then((data) => setTeam(Array.isArray(data) ? data : []))
      .catch(() => setTeam([]));
  }, []);
```

5. En el JSX, **envolver toda la sección `{/* Equipo */}`** (el `<section className="bg-crema py-16 px-6">...</section>` completo) en una condición que la oculta mientras carga o si viene vacía:

```jsx
      {/* Equipo */}
      {team && team.length > 0 && (
        <section className="bg-crema py-16 px-6">
          {/* ...contenido existente de la sección... */}
        </section>
      )}
```

6. Dentro del `team.map((member) => ( ... ))`, hacer estos cambios al `<motion.div>` de cada miembro:
   - `key={member.name}` → `key={member.id}`
   - Reemplazar `<div className="aspect-square w-full bg-gris" />` por:

```jsx
                {member.photo ? (
                  <img
                    src={member.photo.startsWith("http") ? member.photo : UPLOAD_URL + member.photo}
                    alt={member.name}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <div className="aspect-square w-full bg-gris" />
                )}
```

   - Envolver el `<p>` del rol y el `<p>` de la bio en guardas (pueden ser `null` viniendo de la DB):

```jsx
                  {member.role && (
                    <p className="font-ui text-base text-rojo uppercase tracking-widest mb-3">
                      {member.role}
                    </p>
                  )}
                  {member.bio && (
                    <p className="font-mono text-base text-negro/90 leading-relaxed">
                      {member.bio}
                    </p>
                  )}
```

(El `<h3>` del nombre y el resto del markup de la card quedan igual.)

- [ ] **Step 2: Verificar build**

Run: `cd client && npm run build`
Expected: build OK.

- [ ] **Step 3: Commit**

```bash
git add client/src/pages/SobreNosotrosPage.jsx
git commit -m "feat(client): SobreNosotros team section fed from API"
```

---

## Task 10: Verificación E2E manual

**Files:** (ninguno — solo verificación)

- [ ] **Step 1: Levantar backend y frontend**

Run (en terminales separadas):
- `cd server && npm start`
- `cd client && npm run dev`

- [ ] **Step 2: Verificar el sitio público antes de tocar nada**

Abrir `http://localhost:5173/sobre-nosotros`.
Expected: la sección "El Equipo" muestra los 3 miembros sembrados (Valentina Herrera, Lucas Pereyra, Mar Domínguez), cada uno con el cuadro gris (sin foto todavía), rol y bio — visualmente igual que antes del cambio.

- [ ] **Step 3: Verificar el CRUD en el admin**

Loguearse en `http://localhost:5173/admin`, ir a "Equipo" en el menú lateral.
Verificar:
1. La lista muestra los 3 miembros.
2. "+ Nuevo miembro": crear uno con nombre, rol, bio y **foto** (subir una imagen). Guardar → vuelve a la lista, aparece el nuevo con su thumbnail.
3. Editar un miembro existente: cambiar el rol, guardar → se refleja en la lista.
4. Arrastrar filas para reordenar → recargar la página del admin → el orden nuevo persiste.
5. Editar un miembro → "Eliminar" → "Sí, eliminar" → desaparece de la lista.

- [ ] **Step 4: Verificar que el sitio público refleja los cambios**

Recargar `http://localhost:5173/sobre-nosotros`.
Expected: la sección "El Equipo" muestra los miembros en el orden definido en el admin; el miembro con foto muestra la imagen (no el cuadro gris); si se borraron todos los miembros, la sección "El Equipo" no aparece.

- [ ] **Step 5: Correr la suite del server una vez más**

Run: `cd server && npm test`
Expected: todos los tests pasan.

- [ ] **Step 6: Commit final (si quedó algo sin commitear) y cierre**

```bash
git status   # debe estar limpio salvo, quizá, archivos de uploads de prueba
```

Si todo está limpio, la feature está completa.

---

## Self-Review (hecho al escribir el plan)

- **Cobertura del spec:** migración + seed (Task 1) ✓; modelo con CRUD + reorder (Task 2) ✓; controller con validaciones 422/400/404 (Task 3) ✓; rutas pública + admin con `requireAuth` y `reorder` antes de `:id` (Task 4) ✓; helper `getTeamMembers` (Task 5) ✓; `TeamMemberForm` con `ImageUploader` (Task 6) ✓; `EquipoAdminPage` con drag&drop `Reorder` (Task 7) ✓; nav + ruta admin (Task 8) ✓; `SobreNosotrosPage` con fetch, foto, ocultar si vacío, loading (Task 9) ✓; tests del modelo + verificación manual (Tasks 2, 10) ✓. Manifiesto/features/hero/CTA: intencionalmente sin tocar (fuera de alcance). Nota: el spec listaba 6 helpers de API en el cliente; aquí se agrega solo `getTeamMembers` porque `EquipoAdminPage` usa `api` directamente igual que `ArtistasPage` (DRY/YAGNI) — desviación deliberada y consistente con el repo.
- **Placeholders:** ninguno; todo el código está completo en cada step.
- **Consistencia de tipos/nombres:** modelo expone `getAll/getById/create/update/remove/reorder`; controller los usa con esos nombres; rutas importan `listPublic/getOneAdmin/createOne/updateOne/deleteOne/reorderAll`; front usa `/team`, `/admin/team`, `/admin/team/:id`, `/admin/team/reorder` consistentemente. Campos del miembro: `id, name, role, bio, photo, position` en DB, modelo, controller, formulario y página pública.
