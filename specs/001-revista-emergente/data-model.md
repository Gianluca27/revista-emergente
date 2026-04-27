---
description: "Esquema de base de datos PostgreSQL — entidades, relaciones y decisiones de diseño"
type: data-model
date: 2026-04-26
---

# Data Model — Revista Emergente

**Base de datos:** PostgreSQL 15  
**Acceso:** raw SQL con queries parametrizadas vía `pg` (sin ORM pesado)

---

## Diagrama de relaciones (texto)

```
users (1)
  └── (sin relaciones FK — tabla aislada, solo 1 registro)

categories (1) ──── (N) publications
                         │
publications (N) ─────── (N) artists
                    (via publication_artists)
                         │
artists (1)        publications tiene cover_image, body, slug, etc.

podcast_episodes (independiente)

shows (independiente — galería en JSONB)

contact_requests (independiente)
```

---

## Tabla: `users`

```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,   -- bcrypt hash, salt 12
  created_at  TIMESTAMP DEFAULT NOW()
);
```

**Notas:**
- Solo habrá 1 registro. Se crea via seed script, nunca via registro público.
- `password` almacena el hash bcrypt, nunca texto plano.

---

## Tabla: `categories`

```sql
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  slug  VARCHAR(100) UNIQUE NOT NULL,
  name  VARCHAR(100) NOT NULL
);
```

**Valores seed iniciales:**

| slug | name |
|---|---|
| `musica` | Música |
| `cine` | Cine |
| `arte` | Arte |
| `podcast` | Podcast |
| `shows` | Shows |
| `sorteo` | Sorteo |

---

## Tabla: `publications`

Entidad central. Cubre entrevistas, coberturas, podcast y sorteos.

```sql
CREATE TABLE publications (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  title            VARCHAR(255) NOT NULL,
  subtitle         VARCHAR(255),
  category_id      INTEGER REFERENCES categories(id),
  status           VARCHAR(20) DEFAULT 'draft',   -- 'draft' | 'published'
  cover_image      VARCHAR(500),                  -- path relativo a /uploads
  body             TEXT,                          -- HTML enriquecido (TipTap)
  published_at     TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);
```

**Notas:**
- `slug` se genera automáticamente desde `title` (slugify) al crear. Editable.
- `cover_image` es path relativo, ej: `/uploads/abc123-portada.webp`
- `body` es HTML sanitizado producido por TipTap. El cliente renderiza con `dangerouslySetInnerHTML` solo contenido confiable (admin autenticado).
- `published_at` puede ser fecha futura (publicación programada — visual only, sin cron job en v1).
- `updated_at` se actualiza via trigger o manualmente en cada UPDATE.

---

## Tabla: `artists`

Perfiles de artistas. Independiente de publications (relación N:N).

```sql
CREATE TABLE artists (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  bio              TEXT,
  photo            VARCHAR(500),          -- path relativo a /uploads
  instagram_url    VARCHAR(500),
  spotify_url      VARCHAR(500),
  youtube_url      VARCHAR(500),
  soundcloud_url   VARCHAR(500),
  created_at       TIMESTAMP DEFAULT NOW()
);
```

**Notas:**
- Un artista puede no tener publicaciones asociadas (se crea antes de publicar).
- Todos los campos de URL son opcionales.

---

## Tabla: `publication_artists` (relación N:N)

```sql
CREATE TABLE publication_artists (
  publication_id  INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  artist_id       INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, artist_id)
);
```

**Notas:**
- `ON DELETE CASCADE` en ambas FK: si se elimina una publication o un artist, el registro de relación se elimina automáticamente.
- Una publicación puede tener 0, 1 o múltiples artistas.
- Un artista puede estar en múltiples publicaciones.

---

## Tabla: `podcast_episodes`

```sql
CREATE TABLE podcast_episodes (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  cover_image     VARCHAR(500),
  spotify_url     VARCHAR(500),
  youtube_url     VARCHAR(500),
  duration_min    INTEGER,               -- duración en minutos (entero)
  episode_number  INTEGER,
  published_at    TIMESTAMP,
  status          VARCHAR(20) DEFAULT 'draft',  -- 'draft' | 'published'
  created_at      TIMESTAMP DEFAULT NOW()
);
```

**Notas:**
- Entidad independiente — no tiene FK a `publications`.
- `episode_number` es manejado manualmente por la administradora.
- Al menos una de `spotify_url` o `youtube_url` debería estar presente para que el episodio sea útil.

---

## Tabla: `shows`

Coberturas fotográficas de recitales/eventos.

```sql
CREATE TABLE shows (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) UNIQUE NOT NULL,
  venue        VARCHAR(255),
  event_date   DATE,
  description  TEXT,
  cover_image  VARCHAR(500),
  gallery      JSONB DEFAULT '[]',       -- array de paths: ["/uploads/img1.jpg", ...]
  status       VARCHAR(20) DEFAULT 'draft',
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Notas:**
- `gallery` almacena un array JSON de paths relativos. Ejemplo: `["/uploads/show1-a.webp", "/uploads/show1-b.webp"]`
- `cover_image` es la imagen principal (thumbnail en grilla de `/shows`).
- El orden en `gallery` array determina el orden en el lightbox.

---

## Tabla: `contact_requests`

Mensajes de artistas que quieren aparecer en la revista.

```sql
CREATE TABLE contact_requests (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  email        VARCHAR(255) NOT NULL,
  project_name VARCHAR(255),
  message      TEXT NOT NULL,
  instagram    VARCHAR(255),
  status       VARCHAR(20) DEFAULT 'pending',  -- 'pending' | 'read' | 'archived'
  created_at   TIMESTAMP DEFAULT NOW()
);
```

**Notas:**
- No hay FK a `users`. Las solicitudes son de terceros no registrados.
- `status` workflow: `pending` → `read` → `archived`.
- El sistema no responde automáticamente. La administradora responde por email externo.

---

## Índices recomendados

```sql
-- Queries más frecuentes del sitio público
CREATE INDEX idx_publications_status ON publications(status);
CREATE INDEX idx_publications_category ON publications(category_id);
CREATE INDEX idx_publications_slug ON publications(slug);
CREATE INDEX idx_publications_published_at ON publications(published_at DESC);

CREATE INDEX idx_artists_slug ON artists(slug);
CREATE INDEX idx_shows_slug ON shows(slug);
CREATE INDEX idx_shows_status ON shows(status);

CREATE INDEX idx_podcast_status ON podcast_episodes(status);
CREATE INDEX idx_podcast_number ON podcast_episodes(episode_number DESC);

CREATE INDEX idx_contact_status ON contact_requests(status);
```

---

## Script de seed inicial

```sql
-- Categorías base
INSERT INTO categories (slug, name) VALUES
  ('musica', 'Música'),
  ('cine', 'Cine'),
  ('arte', 'Arte'),
  ('podcast', 'Podcast'),
  ('shows', 'Shows'),
  ('sorteo', 'Sorteo');

-- Usuario administradora (password generado con bcrypt, nunca en texto plano aquí)
-- Ejecutar via script Node.js que hashea antes de insertar:
-- node scripts/seed-admin.js --email admin@revistaemergente.ar --password <PASSWORD>
```
