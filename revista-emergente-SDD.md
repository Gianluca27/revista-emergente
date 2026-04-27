# SDD — Revista Emergente
**Software Design Document v1.0**
**Fecha:** Abril 2026
**Stack:** React + Tailwind CSS · Node.js + Express · PostgreSQL · VPS Hetzner

---

## 0. Índice

1. Visión general del proyecto
2. Identidad visual y sistema de diseño
3. Arquitectura del sistema
4. Modelo de datos
5. API — Endpoints
6. Frontend — Páginas y componentes
7. Panel de administración
8. Animaciones y comportamiento visual
9. Infraestructura y deployment
10. Consideraciones de seguridad

---

## 1. Visión general del proyecto

### 1.1 Descripción
Landing page pública + panel de administración para **Revista Emergente**, una revista cultural independiente argentina enfocada en artistas emergentes. El sitio replica y amplifica la identidad visual de su perfil de Instagram: estética punk/DIY, tipografía rota, paleta rojo-negro-blanco.

### 1.2 Usuarios
| Rol | Descripción |
|---|---|
| **Visitante** | Cualquier persona que accede al sitio. Sin autenticación. |
| **Administradora** | Una sola usuaria (la editora). Acceso al panel con credenciales. |

### 1.3 Objetivos del sistema
- Dar presencia web independiente a la revista (fuera de Instagram).
- Publicar entrevistas, coberturas de shows, podcast y sorteos.
- Permitir a la administradora gestionar todo el contenido sin tocar código.
- Habilitar un canal de contacto para artistas que quieran aparecer en la revista.

---

## 2. Identidad visual y sistema de diseño

### 2.1 Paleta de colores
```css
--color-rojo:      #C0001A;   /* Rojo Emergente — acento principal */
--color-negro:     #0A0A0A;   /* Fondo oscuro */
--color-blanco:    #F5F0EB;   /* Blanco roto / crudo */
--color-gris:      #1A1A1A;   /* Cards, superficies elevadas */
--color-gris-mid:  #3A3A3A;   /* Bordes, separadores */
```

### 2.2 Tipografía

| Uso | Familia | Fuente |
|---|---|---|
| Display / Hero | **Bebas Neue** | Google Fonts |
| Títulos secundarios | **Anton** | Google Fonts |
| Cuerpo de texto | **Space Mono** | Google Fonts |
| UI / Labels | **Barlow Condensed** | Google Fonts |

> **CRÍTICO:** Nunca usar Arial, Inter, Roboto ni fuentes de sistema. La tipografía es parte esencial de la identidad.

### 2.3 Estética general
- Fondo negro/oscuro predominante.
- Texto en blanco roto o rojo.
- Texturas de grano sutil sobre fondos (efecto fanzine/fotocopia).
- Bordes y cortes asimétricos, elementos que "rompen" la grilla.
- Imágenes en alto contraste; posibilidad de filtro rojo duotone.
- Cursores y hover states con personalidad (color rojo, underline grueso).

---

## 3. Arquitectura del sistema

```
┌─────────────────────────────────────────────────────┐
│                    VPS Hetzner                       │
│                                                     │
│  ┌──────────────┐     ┌──────────────────────────┐  │
│  │   NGINX      │────▶│  React App (build)       │  │
│  │  (reverse    │     │  /var/www/emergente       │  │
│  │   proxy)     │     └──────────────────────────┘  │
│  │              │                                   │
│  │              │────▶┌──────────────────────────┐  │
│  │              │     │  Node.js + Express API   │  │
│  │              │     │  puerto 3001             │  │
│  └──────────────┘     └──────────┬───────────────┘  │
│                                  │                   │
│                       ┌──────────▼───────────────┐  │
│                       │    PostgreSQL             │  │
│                       │    puerto 5432 (local)   │  │
│                       └──────────────────────────┘  │
│                                                     │
│  ┌──────────────────────────────────────────────┐   │
│  │  /uploads  (imágenes subidas vía admin)      │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3.1 Repositorio (estructura de carpetas)

```
revista-emergente/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Fuentes locales, SVGs, texturas
│   │   ├── components/        # Componentes reutilizables
│   │   │   ├── ui/            # Botones, cards, badges
│   │   │   ├── layout/        # Navbar, Footer, Layout
│   │   │   └── sections/      # Secciones de página
│   │   ├── pages/             # Páginas del sitio público
│   │   ├── admin/             # Panel de administración
│   │   │   ├── pages/
│   │   │   └── components/
│   │   ├── hooks/             # Custom hooks
│   │   ├── services/          # Llamadas a la API
│   │   ├── store/             # Estado global (Zustand)
│   │   ├── utils/
│   │   └── App.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                    # Node.js + Express backend
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/            # Queries SQL / ORM
│   │   ├── middleware/
│   │   ├── services/          # Lógica de negocio
│   │   └── app.js
│   ├── migrations/            # Scripts SQL de migración
│   ├── uploads/               # Archivos subidos (gitignored)
│   └── package.json
│
├── nginx/
│   └── emergente.conf
├── .env.example
└── README.md
```

---

## 4. Modelo de datos

### 4.1 Tabla: `users`
```sql
CREATE TABLE users (
  id          SERIAL PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,         -- bcrypt hash
  created_at  TIMESTAMP DEFAULT NOW()
);
```
> Solo habrá un registro en esta tabla (la administradora). Se crea via seed script.

---

### 4.2 Tabla: `categories`
```sql
CREATE TABLE categories (
  id    SERIAL PRIMARY KEY,
  slug  VARCHAR(100) UNIQUE NOT NULL,   -- 'musica', 'cine', 'arte', 'podcast', 'shows', 'sorteo'
  name  VARCHAR(100) NOT NULL           -- 'Música', 'Cine', 'Arte', etc.
);
```

---

### 4.3 Tabla: `publications`
Entidad central del sistema. Cubre entrevistas, coberturas, podcast y sorteos.

```sql
CREATE TABLE publications (
  id               SERIAL PRIMARY KEY,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  title            VARCHAR(255) NOT NULL,
  subtitle         VARCHAR(255),
  category_id      INTEGER REFERENCES categories(id),
  status           VARCHAR(20) DEFAULT 'draft',   -- 'draft' | 'published'
  cover_image      VARCHAR(500),                  -- path relativo a /uploads
  body             TEXT,                          -- Contenido HTML enriquecido (TipTap)
  published_at     TIMESTAMP,
  created_at       TIMESTAMP DEFAULT NOW(),
  updated_at       TIMESTAMP DEFAULT NOW()
);
```

---

### 4.4 Tabla: `artists`
Entidad independiente. Una publicación puede tener un artista asociado.

```sql
CREATE TABLE artists (
  id               SERIAL PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) UNIQUE NOT NULL,
  bio              TEXT,
  photo            VARCHAR(500),
  instagram_url    VARCHAR(500),
  spotify_url      VARCHAR(500),
  youtube_url      VARCHAR(500),
  soundcloud_url   VARCHAR(500),
  created_at       TIMESTAMP DEFAULT NOW()
);
```

---

### 4.5 Tabla: `publication_artists` (relación N:N)
```sql
CREATE TABLE publication_artists (
  publication_id  INTEGER REFERENCES publications(id) ON DELETE CASCADE,
  artist_id       INTEGER REFERENCES artists(id) ON DELETE CASCADE,
  PRIMARY KEY (publication_id, artist_id)
);
```

---

### 4.6 Tabla: `podcast_episodes`
```sql
CREATE TABLE podcast_episodes (
  id              SERIAL PRIMARY KEY,
  title           VARCHAR(255) NOT NULL,
  description     TEXT,
  cover_image     VARCHAR(500),
  spotify_url     VARCHAR(500),
  youtube_url     VARCHAR(500),
  duration_min    INTEGER,                   -- duración en minutos
  episode_number  INTEGER,
  published_at    TIMESTAMP,
  status          VARCHAR(20) DEFAULT 'draft',
  created_at      TIMESTAMP DEFAULT NOW()
);
```

---

### 4.7 Tabla: `shows`
Coberturas de recitales/eventos.

```sql
CREATE TABLE shows (
  id           SERIAL PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  slug         VARCHAR(255) UNIQUE NOT NULL,
  venue        VARCHAR(255),
  event_date   DATE,
  description  TEXT,
  cover_image  VARCHAR(500),
  gallery      JSONB DEFAULT '[]',           -- array de paths de imágenes
  status       VARCHAR(20) DEFAULT 'draft',
  created_at   TIMESTAMP DEFAULT NOW()
);
```

---

### 4.8 Tabla: `contact_requests`
Solicitudes de artistas que quieren aparecer en la revista.

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

---

## 5. API — Endpoints

### 5.1 Autenticación

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/auth/login` | Login con email + password. Retorna JWT. |
| `POST` | `/api/auth/logout` | Invalida sesión (cliente elimina token). |
| `GET`  | `/api/auth/me` | Verifica token. Retorna datos del usuario. |

**Request login:**
```json
{ "email": "admin@emergente.ar", "password": "..." }
```
**Response login:**
```json
{ "token": "eyJ...", "user": { "id": 1, "email": "..." } }
```

---

### 5.2 Publicaciones (público)

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/api/publications` | Lista publicaciones publicadas. Soporta `?category=musica&page=1&limit=9` |
| `GET` | `/api/publications/:slug` | Detalle de una publicación. |
| `GET` | `/api/publications/featured` | Las 3 publicaciones destacadas para el hero. |

---

### 5.3 Publicaciones (admin — requiere JWT)

| Método | Ruta | Descripción |
|---|---|---|
| `GET`    | `/api/admin/publications` | Lista todas (incluyendo drafts). |
| `POST`   | `/api/admin/publications` | Crear nueva publicación. |
| `PUT`    | `/api/admin/publications/:id` | Editar publicación. |
| `DELETE` | `/api/admin/publications/:id` | Eliminar publicación. |
| `PATCH`  | `/api/admin/publications/:id/publish` | Cambiar status a 'published'. |
| `PATCH`  | `/api/admin/publications/:id/unpublish` | Cambiar status a 'draft'. |

---

### 5.4 Artistas

| Método | Ruta | Descripción |
|---|---|---|
| `GET`    | `/api/artists` | Lista todos los artistas. |
| `GET`    | `/api/artists/:slug` | Detalle de artista + sus publicaciones. |
| `POST`   | `/api/admin/artists` | Crear artista. (auth) |
| `PUT`    | `/api/admin/artists/:id` | Editar artista. (auth) |
| `DELETE` | `/api/admin/artists/:id` | Eliminar artista. (auth) |

---

### 5.5 Podcast

| Método | Ruta | Descripción |
|---|---|---|
| `GET`  | `/api/podcast` | Lista episodios publicados. |
| `GET`  | `/api/podcast/:id` | Detalle de episodio. |
| `POST` | `/api/admin/podcast` | Crear episodio. (auth) |
| `PUT`  | `/api/admin/podcast/:id` | Editar episodio. (auth) |
| `DELETE` | `/api/admin/podcast/:id` | Eliminar episodio. (auth) |

---

### 5.6 Shows

| Método | Ruta | Descripción |
|---|---|---|
| `GET`  | `/api/shows` | Lista coberturas publicadas. |
| `GET`  | `/api/shows/:slug` | Detalle de cobertura + galería. |
| `POST` | `/api/admin/shows` | Crear cobertura. (auth) |
| `PUT`  | `/api/admin/shows/:id` | Editar cobertura. (auth) |
| `DELETE` | `/api/admin/shows/:id` | Eliminar cobertura. (auth) |

---

### 5.7 Contacto

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/contact` | Enviar solicitud de contacto (público). |
| `GET`  | `/api/admin/contact` | Ver todas las solicitudes. (auth) |
| `PATCH` | `/api/admin/contact/:id/status` | Cambiar status. (auth) |

---

### 5.8 Upload de imágenes

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/admin/upload` | Sube una imagen. Retorna URL. Max 5MB. (auth) |

---

## 6. Frontend — Páginas y componentes

### 6.1 Rutas del sitio público

| Ruta | Página |
|---|---|
| `/` | Home |
| `/entrevistas` | Listado de entrevistas |
| `/entrevistas/:slug` | Detalle de entrevista |
| `/shows` | Coberturas de shows |
| `/shows/:slug` | Detalle de show + galería |
| `/podcast` | Listado de episodios |
| `/sobre-nosotros` | Sobre Nosotros |
| `/contacto` | Contacto para artistas |
| `/artistas/:slug` | Perfil de artista |

### 6.2 Rutas del panel admin

| Ruta | Página |
|---|---|
| `/admin/login` | Login |
| `/admin` | Dashboard (resumen) |
| `/admin/publicaciones` | Gestión de publicaciones |
| `/admin/publicaciones/nueva` | Crear publicación |
| `/admin/publicaciones/:id/editar` | Editar publicación |
| `/admin/artistas` | Gestión de artistas |
| `/admin/podcast` | Gestión de episodios |
| `/admin/shows` | Gestión de coberturas |
| `/admin/contacto` | Bandeja de solicitudes |

---

### 6.3 Componentes globales

**`<Navbar />`**
- Logo "EMERGENTE" en tipografía Bebas Neue.
- Links: Entrevistas · Shows · Podcast · Sobre Nosotros · Contacto.
- En mobile: hamburger menu con overlay full-screen.
- Comportamiento: transparent en hero, fondo negro al hacer scroll.

**`<Footer />`**
- Logo, links de sección, redes sociales (Instagram, Spotify, YouTube).
- Texto: "Revista Emergente — Buenos Aires, Argentina".
- Tipografía Space Mono, tamaño pequeño.

**`<PublicationCard />`**
- Props: `title`, `subtitle`, `category`, `coverImage`, `slug`, `date`.
- Hover: imagen con leve zoom + overlay rojo semitransparente.
- Badge de categoría en rojo.

**`<CategoryFilter />`**
- Botones pill para filtrar: Todos · Música · Cine · Arte · Shows · Podcast.
- Estado activo: fondo rojo, texto negro.

---

### 6.4 Página: Home (`/`)

**Secciones en orden:**

1. **Hero animado**
   - Fondo negro con textura grano.
   - Animación de entrada: letras de "EMERGENTE" aparecen una por una (ver sección 8).
   - Subtítulo: "Revista · Podcast · Movida cultural" con fade-in retrasado.
   - Scroll indicator animado (flecha o texto "SCROLL" que pulsa).

2. **Últimas publicaciones** (grid 3 columnas, últimas 6)
   - Título sección: "LO ÚLTIMO" en Anton/Bebas.
   - `<PublicationCard />` con animación de entrada al entrar al viewport (stagger).

3. **Banner Podcast**
   - Sección horizontal con fondo rojo.
   - Texto "ESCUCHÁ EL PODCAST" + link a episodio más reciente.
   - Animación: texto que hace marquee/loop horizontal.

4. **Shows recientes** (últimas 3 coberturas)
   - Grid asimétrico 1 imagen grande + 2 chicas.
   - Hover con título en overlay.

5. **Call to Action — Artistas**
   - Texto: "¿ERES ARTISTA? CONTANOS TU PROYECTO"
   - Botón que lleva a `/contacto`.
   - Estética: tipografía recortada, efecto "fanzine".

---

### 6.5 Página: Entrevistas (`/entrevistas`)

- Header con título "ENTREVISTAS" en letras grandes.
- `<CategoryFilter />` para filtrar por subcategoría.
- Grid de `<PublicationCard />` con paginación (9 por página).
- Loading skeleton con pulso mientras carga.

---

### 6.6 Página: Detalle de publicación (`/entrevistas/:slug`)

- Imagen de cover full-width con overlay gradiente.
- Título + subtítulo.
- Badges: categoría, artista asociado, fecha.
- Cuerpo del artículo (HTML renderizado desde TipTap, con estilos propios).
- Bloque de artista: foto, bio, links a redes/Spotify.
- Sección "Más entrevistas" al final (3 cards relacionadas).

---

### 6.7 Página: Podcast (`/podcast`)

- Lista de episodios con número, título, descripción, duración.
- Links directos a Spotify / YouTube por episodio.
- No hay reproductor embebido nativo (se delega a plataformas externas).

---

### 6.8 Página: Shows (`/shows`)

- Grid masonry de coberturas (imágenes de distintos tamaños).
- Click en cobertura → página de detalle con galería de fotos.
- Galería: lightbox full-screen con navegación teclado/swipe.

---

### 6.9 Página: Sobre Nosotros (`/sobre-nosotros`)

- Texto manifiesto de la revista.
- Sección "¿Qué es Emergente?" (como el post que compartiste).
- Foto o collage del equipo (por ahora solo la editora).

---

### 6.10 Página: Contacto (`/contacto`)

- Formulario con campos: Nombre · Email · Nombre del proyecto · Instagram · Mensaje.
- Texto introductorio: "SE BUSCA gente relacionada al ambiente artístico..."
- Validación client-side (React Hook Form + Zod).
- Submit → POST `/api/contact` → mensaje de confirmación.

---

## 7. Panel de administración

### 7.1 Login (`/admin/login`)

- Formulario email + password.
- JWT guardado en `httpOnly cookie` (no localStorage).
- Redirect a `/admin` si ya hay sesión activa.
- Estética: versión más limpia del sitio, fondo oscuro, logo de la revista.

---

### 7.2 Dashboard (`/admin`)

Tarjetas de resumen:
- Total de publicaciones publicadas.
- Borradores pendientes.
- Episodios de podcast.
- Solicitudes de contacto sin leer (con badge rojo si hay nuevas).

Links rápidos a cada sección.

---

### 7.3 Gestión de publicaciones (`/admin/publicaciones`)

- Tabla con columnas: Título · Categoría · Artista · Status · Fecha · Acciones.
- Acciones por fila: Editar · Publicar/Despublicar · Eliminar.
- Botón "Nueva publicación" → `/admin/publicaciones/nueva`.
- Filtro por status (Todos / Publicados / Borradores).

---

### 7.4 Editor de publicaciones

Campos del formulario:
- **Título** (text input)
- **Subtítulo** (text input)
- **Categoría** (select: Música / Cine / Arte / Shows / Podcast / Sorteo)
- **Artista asociado** (select con búsqueda, opcional)
- **Imagen de portada** (upload con preview)
- **Cuerpo** (editor TipTap: bold, italic, headings, links, imágenes inline)
- **Status** (Borrador / Publicado)
- **Fecha de publicación** (date picker, se puede poner fecha futura)

Botones: "Guardar borrador" · "Publicar" · "Cancelar"

---

### 7.5 Gestión de artistas (`/admin/artistas`)

Tabla: Nombre · Foto (thumbnail) · Instagram · Acciones.

Formulario de artista:
- Nombre, bio (textarea), foto (upload), Instagram URL, Spotify URL, YouTube URL, SoundCloud URL.

---

### 7.6 Gestión de podcast (`/admin/podcast`)

Tabla: N° Episodio · Título · Duración · Status.

Formulario:
- Título, descripción, número de episodio, duración (minutos), Spotify URL, YouTube URL, imagen de portada, status.

---

### 7.7 Gestión de shows (`/admin/shows`)

Formulario:
- Título, venue (lugar), fecha del evento, descripción, imagen de portada, galería de fotos (upload múltiple), status.

---

### 7.8 Bandeja de contacto (`/admin/contacto`)

- Lista de solicitudes con nombre, proyecto, fecha, status (pendiente/leída/archivada).
- Click en una → drawer lateral con todos los datos + botón de responder (abre cliente de email nativo).
- Botón para marcar como leída o archivar.

---

## 8. Animaciones y comportamiento visual

### 8.1 Hero — Letras de "EMERGENTE"

```
Comportamiento:
- Al cargar la página, las 9 letras de "EMERGENTE" aparecen de a una.
- Cada letra cae/emerge desde abajo con un leve bounce.
- Delay entre letras: 80ms stagger.
- Duración por letra: 400ms.
- Easing: cubic-bezier(0.22, 1, 0.36, 1) — overshoot suave.
- Una vez completa la palabra, leve vibración/glitch en toda la palabra (150ms).
```

Implementación sugerida: CSS keyframes + inline `style={{ animationDelay }}` por letra, o Framer Motion `staggerChildren`.

### 8.2 Efecto glitch en títulos

- En hover sobre el logo y títulos de sección grandes: efecto glitch con `::before` y `::after` pseudo-elementos desplazados en rojo y blanco.
- Duración: 300ms, solo en hover, no en loop.

### 8.3 Entrada de cards al viewport

- `IntersectionObserver` para detectar cuando una card entra al viewport.
- Animación: `opacity 0→1` + `translateY 20px→0`, duración 400ms.
- Stagger entre cards del mismo grupo: 100ms.

### 8.4 Marquee / ticker horizontal

- En la sección de podcast banner: texto en loop horizontal continuo.
- CSS `animation: marquee linear infinite`.
- Velocidad: ~40s para un ciclo completo.

### 8.5 Cursor personalizado

- En desktop: cursor default reemplazado por un círculo pequeño rojo (12px).
- Al hacer hover sobre links/botones: cursor crece a 24px con borde rojo.
- Implementación: div absoluto que sigue el mouse con `transition: transform 100ms`.

### 8.6 Textura de grano

- Overlay SVG de ruido en fondo del hero y secciones oscuras.
- Opacidad: 3-5% para que sea sutil.
- No afecta legibilidad.

### 8.7 Transiciones de página

- React Router + Framer Motion `AnimatePresence`.
- Transición: fade rápido (200ms) al cambiar de ruta.

---

## 9. Infraestructura y deployment

### 9.1 Configuración del servidor VPS (Hetzner)

**Stack de servidor:**
- Ubuntu 22.04 LTS
- Node.js 20.x (via NVM)
- PostgreSQL 15
- NGINX como reverse proxy
- PM2 para gestión del proceso Node.js
- Certbot (Let's Encrypt) para SSL

### 9.2 NGINX — configuración base

```nginx
server {
    listen 80;
    server_name revistaemergente.ar www.revistaemergente.ar;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name revistaemergente.ar www.revistaemergente.ar;

    ssl_certificate     /etc/letsencrypt/live/revistaemergente.ar/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/revistaemergente.ar/privkey.pem;

    # Servir el build de React
    location / {
        root /var/www/emergente/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy al backend
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Servir uploads
    location /uploads/ {
        alias /var/www/emergente/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
```

### 9.3 Variables de entorno (`.env`)

```env
# Server
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://emergente_user:PASSWORD@localhost:5432/emergente_db

# Auth
JWT_SECRET=...           # string random de 64+ chars
JWT_EXPIRES_IN=7d

# Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880    # 5MB en bytes

# Email (para notificaciones de contacto — opcional)
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NOTIFY_EMAIL=admin@revistaemergente.ar
```

### 9.4 PM2 — proceso manager

```json
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'emergente-api',
    script: './server/src/app.js',
    env_production: {
      NODE_ENV: 'production'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M'
  }]
}
```

### 9.5 Flujo de deployment

```bash
# 1. Build del frontend
cd client && npm run build

# 2. Copiar build al servidor (o usar CI/CD)
rsync -avz dist/ user@vps:/var/www/emergente/client/dist/

# 3. En el servidor: pull del backend y restart
git pull origin main
cd server && npm install --production
pm2 restart emergente-api
```

---

## 10. Consideraciones de seguridad

| Área | Medida |
|---|---|
| **Autenticación** | JWT con expiración de 7 días. Almacenado en httpOnly cookie (no accesible por JS). |
| **Passwords** | Hasheados con bcrypt (salt rounds: 12). |
| **Uploads** | Validación de tipo MIME en el servidor (solo jpg, png, webp). Renombrado de archivos con UUID. Tamaño máximo: 5MB. |
| **SQL Injection** | Queries parametrizadas (nunca string interpolation). |
| **CORS** | Solo permitir el origen del frontend en producción. |
| **Rate limiting** | `express-rate-limit` en las rutas de login y contacto. Login: 5 intentos cada 15 minutos. |
| **Helmet.js** | Headers HTTP de seguridad (CSP, X-Frame-Options, etc). |
| **Variables sensibles** | Nunca en el repo. Solo en `.env` fuera del control de versiones. |

---

## Apéndice A — Dependencias principales

### Frontend (`client/`)
```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "framer-motion": "^11",
  "tailwindcss": "^3",
  "@tiptap/react": "^2",
  "react-hook-form": "^7",
  "zod": "^3",
  "zustand": "^4",
  "axios": "^1"
}
```

### Backend (`server/`)
```json
{
  "express": "^4",
  "pg": "^8",
  "bcrypt": "^5",
  "jsonwebtoken": "^9",
  "multer": "^1",
  "helmet": "^7",
  "cors": "^2",
  "express-rate-limit": "^7",
  "dotenv": "^16"
}
```

---

## Apéndice B — Orden de implementación sugerido

1. **Setup inicial** — repos, estructura de carpetas, `.env`, base de datos con migraciones.
2. **Backend auth** — login, JWT, middleware de protección de rutas.
3. **Backend CRUD** — publicaciones → artistas → podcast → shows → contacto.
4. **Frontend base** — Navbar, Footer, Router, sistema de colores/tipografía.
5. **Home + Hero animado** — primer impacto visual.
6. **Páginas de listado** — Entrevistas, Shows, Podcast.
7. **Páginas de detalle** — artículo individual, perfil de artista.
8. **Contacto** — formulario + integración API.
9. **Panel admin** — login, dashboard, CRUD de publicaciones.
10. **Panel admin** — resto de secciones (artistas, podcast, shows, bandeja de contacto).
11. **Animaciones y detalles visuales** — glitch, cursor, texturas.
12. **Deployment** — NGINX, SSL, PM2, dominio.

---

*SDD — Revista Emergente v1.0 — Abril 2026*
