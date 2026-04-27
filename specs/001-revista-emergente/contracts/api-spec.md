---
description: "Contratos de API — todos los endpoints REST del backend Express"
type: contract
date: 2026-04-26
---

# API Contract — Revista Emergente

**Base URL:** `https://revistaemergente.ar/api`  
**Formato:** JSON  
**Auth:** JWT en httpOnly cookie (`token`). Las rutas protegidas requieren cookie válida.

---

## Convenciones

- Rutas públicas: sin prefijo admin, sin auth
- Rutas protegidas: prefijo `/admin/`, requieren cookie JWT válida
- Errores siguen formato:
  ```json
  { "error": "Mensaje descriptivo" }
  ```
- Paginación: `?page=1&limit=9` (defaults: page=1, limit=9)
- Status HTTP estándar: 200, 201, 400, 401, 403, 404, 422, 429, 500

---

## Auth

### `POST /api/auth/login`

Autenticar administradora. Establece httpOnly cookie.

**Request:**
```json
{
  "email": "admin@revistaemergente.ar",
  "password": "..."
}
```

**Response 200:**
```json
{
  "user": { "id": 1, "email": "admin@revistaemergente.ar" }
}
```
*(JWT va en Set-Cookie httpOnly, no en body)*

**Response 401:**
```json
{ "error": "Credenciales inválidas" }
```

**Response 429:** Rate limit alcanzado (5 intentos / 15 min)

---

### `POST /api/auth/logout`

Invalida sesión. El cliente elimina la cookie.

**Response 200:**
```json
{ "message": "Sesión cerrada" }
```

---

### `GET /api/auth/me`

Verificar token activo. Usado por el frontend para proteger rutas admin.

**Headers:** Cookie con JWT válido

**Response 200:**
```json
{ "id": 1, "email": "admin@revistaemergente.ar" }
```

**Response 401:** Token inválido o expirado

---

## Publicaciones (público)

### `GET /api/publications`

Listar publicaciones publicadas.

**Query params:**
- `?category=musica` — filtrar por slug de categoría
- `?page=1&limit=9` — paginación

**Response 200:**
```json
{
  "data": [
    {
      "id": 1,
      "slug": "entrevista-artista-x",
      "title": "Entrevista con Artista X",
      "subtitle": "Subtítulo opcional",
      "category": { "id": 1, "slug": "musica", "name": "Música" },
      "cover_image": "/uploads/portada-abc123.webp",
      "published_at": "2026-04-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 9,
    "total": 42,
    "totalPages": 5
  }
}
```

---

### `GET /api/publications/featured`

Las 3 publicaciones más recientes publicadas para el hero/home.

**Response 200:** Array de hasta 3 publicaciones (misma forma que arriba)

---

### `GET /api/publications/:slug`

Detalle completo de una publicación pública.

**Response 200:**
```json
{
  "id": 1,
  "slug": "entrevista-artista-x",
  "title": "Entrevista con Artista X",
  "subtitle": "...",
  "category": { "id": 1, "slug": "musica", "name": "Música" },
  "status": "published",
  "cover_image": "/uploads/portada-abc123.webp",
  "body": "<p>HTML enriquecido...</p>",
  "published_at": "2026-04-01T00:00:00Z",
  "artists": [
    {
      "id": 1,
      "name": "Artista X",
      "slug": "artista-x",
      "bio": "...",
      "photo": "/uploads/artista-x.webp",
      "instagram_url": "https://instagram.com/artistax",
      "spotify_url": "https://open.spotify.com/artist/...",
      "youtube_url": null,
      "soundcloud_url": null
    }
  ]
}
```

**Response 404:** Publicación no encontrada o no publicada

---

## Publicaciones (admin — requiere JWT)

### `GET /api/admin/publications`

Listar todas las publicaciones, incluyendo borradores.

**Query params:** `?status=draft|published`, `?page=1&limit=20`

**Response 200:** Misma forma que GET público, pero incluye `status: 'draft'`

---

### `POST /api/admin/publications`

Crear publicación.

**Request:**
```json
{
  "title": "Título",
  "subtitle": "Subtítulo opcional",
  "category_id": 1,
  "status": "draft",
  "cover_image": "/uploads/imagen-abc123.webp",
  "body": "<p>Contenido HTML</p>",
  "published_at": "2026-05-01T00:00:00Z",
  "artist_ids": [1, 2]
}
```

**Response 201:**
```json
{ "id": 42, "slug": "titulo-generado-automaticamente" }
```

**Response 422:** Validación fallida (título requerido, category_id inválido, etc.)

---

### `PUT /api/admin/publications/:id`

Editar publicación existente.

**Request:** Mismos campos que POST (todos opcionales en PUT, solo se actualizan los enviados)

**Response 200:** Publicación actualizada completa

**Response 404:** Publicación no encontrada

---

### `DELETE /api/admin/publications/:id`

Eliminar publicación. La relación en `publication_artists` se elimina en CASCADE.

**Response 200:**
```json
{ "message": "Publicación eliminada" }
```

---

### `PATCH /api/admin/publications/:id/publish`

Cambiar status a `'published'`. Setea `published_at = NOW()` si era null.

**Response 200:**
```json
{ "id": 42, "status": "published", "published_at": "2026-04-26T..." }
```

---

### `PATCH /api/admin/publications/:id/unpublish`

Cambiar status a `'draft'`.

**Response 200:**
```json
{ "id": 42, "status": "draft" }
```

---

## Artistas (público)

### `GET /api/artists`

Listar todos los artistas.

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Artista X",
    "slug": "artista-x",
    "photo": "/uploads/artista-x.webp",
    "instagram_url": "https://instagram.com/artistax"
  }
]
```

---

### `GET /api/artists/:slug`

Perfil completo de artista + sus publicaciones asociadas.

**Response 200:**
```json
{
  "id": 1,
  "name": "Artista X",
  "slug": "artista-x",
  "bio": "...",
  "photo": "/uploads/artista-x.webp",
  "instagram_url": "...",
  "spotify_url": "...",
  "youtube_url": null,
  "soundcloud_url": null,
  "publications": [
    { "id": 1, "slug": "entrevista-artista-x", "title": "...", "cover_image": "...", "published_at": "..." }
  ]
}
```

---

## Artistas (admin — requiere JWT)

### `POST /api/admin/artists`

**Request:**
```json
{
  "name": "Artista X",
  "bio": "Texto bio",
  "photo": "/uploads/foto.webp",
  "instagram_url": "https://instagram.com/artistax",
  "spotify_url": null,
  "youtube_url": null,
  "soundcloud_url": null
}
```

**Response 201:** `{ "id": 1, "slug": "artista-x" }`

---

### `PUT /api/admin/artists/:id`

Editar artista. Campos opcionales en PUT.

**Response 200:** Artista actualizado completo

---

### `DELETE /api/admin/artists/:id`

Eliminar artista. Relaciones en `publication_artists` se eliminan en CASCADE.

**Response 200:** `{ "message": "Artista eliminado" }`

---

## Podcast (público)

### `GET /api/podcast`

Listar episodios publicados, ordenados por `episode_number DESC`.

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Episodio 1 — Título",
    "description": "...",
    "cover_image": "/uploads/ep1.webp",
    "spotify_url": "https://open.spotify.com/episode/...",
    "youtube_url": "https://youtube.com/watch?v=...",
    "duration_min": 45,
    "episode_number": 1,
    "published_at": "2026-03-01T00:00:00Z"
  }
]
```

---

### `GET /api/podcast/:id`

Detalle de un episodio.

**Response 200:** Episodio completo (misma forma que arriba)

---

## Podcast (admin — requiere JWT)

### `POST /api/admin/podcast`

**Request:**
```json
{
  "title": "Episodio 10 — Título",
  "description": "...",
  "cover_image": "/uploads/ep10.webp",
  "spotify_url": "...",
  "youtube_url": "...",
  "duration_min": 52,
  "episode_number": 10,
  "status": "draft"
}
```

**Response 201:** `{ "id": 10 }`

---

### `PUT /api/admin/podcast/:id` / `DELETE /api/admin/podcast/:id`

Editar / eliminar episodio. Response análogo a publicaciones.

---

## Shows (público)

### `GET /api/shows`

Listar coberturas publicadas.

**Response 200:**
```json
[
  {
    "id": 1,
    "title": "Festival X",
    "slug": "festival-x",
    "venue": "Venue Y",
    "event_date": "2026-03-15",
    "cover_image": "/uploads/festival-x-cover.webp",
    "published_at": "2026-03-20T00:00:00Z"
  }
]
```

---

### `GET /api/shows/:slug`

Detalle de cobertura + galería completa.

**Response 200:**
```json
{
  "id": 1,
  "title": "Festival X",
  "slug": "festival-x",
  "venue": "Venue Y",
  "event_date": "2026-03-15",
  "description": "...",
  "cover_image": "/uploads/festival-x-cover.webp",
  "gallery": [
    "/uploads/festival-x-01.webp",
    "/uploads/festival-x-02.webp",
    "/uploads/festival-x-03.webp"
  ]
}
```

---

## Shows (admin — requiere JWT)

### `POST /api/admin/shows`

**Request:**
```json
{
  "title": "Festival X",
  "venue": "Venue Y",
  "event_date": "2026-03-15",
  "description": "...",
  "cover_image": "/uploads/cover.webp",
  "gallery": ["/uploads/img1.webp", "/uploads/img2.webp"],
  "status": "draft"
}
```

**Response 201:** `{ "id": 1, "slug": "festival-x" }`

---

### `PUT /api/admin/shows/:id` / `DELETE /api/admin/shows/:id`

Análogo a otros recursos admin.

---

## Contacto

### `POST /api/contact`

Enviar solicitud de contacto (público, rate-limited).

**Request:**
```json
{
  "name": "Nombre Artista",
  "email": "artista@email.com",
  "project_name": "Nombre del Proyecto",
  "instagram": "@handle",
  "message": "Mensaje del artista..."
}
```

**Response 201:**
```json
{ "message": "Solicitud enviada. Te contactaremos a la brevedad." }
```

**Response 422:** Validación fallida (name, email, message son requeridos)

**Response 429:** Rate limit alcanzado

---

### `GET /api/admin/contact`

Listar todas las solicitudes (admin).

**Query params:** `?status=pending|read|archived`

**Response 200:**
```json
[
  {
    "id": 1,
    "name": "Nombre Artista",
    "email": "artista@email.com",
    "project_name": "...",
    "instagram": "@handle",
    "message": "...",
    "status": "pending",
    "created_at": "2026-04-26T..."
  }
]
```

---

### `PATCH /api/admin/contact/:id/status`

Cambiar status de solicitud.

**Request:**
```json
{ "status": "read" }
```

**Valores válidos:** `"pending"`, `"read"`, `"archived"`

**Response 200:** Solicitud actualizada

---

## Upload de imágenes (admin — requiere JWT)

### `POST /api/admin/upload`

Subir imagen. Multipart form data.

**Request:** `Content-Type: multipart/form-data`  
**Field:** `image` (file)  
**Restricciones:** jpg, png, webp. Máximo 5MB.

**Response 201:**
```json
{ "url": "/uploads/abc123uuid-filename.webp" }
```

**Response 400:** Tipo de archivo no permitido  
**Response 413:** Archivo demasiado grande (> 5MB)
