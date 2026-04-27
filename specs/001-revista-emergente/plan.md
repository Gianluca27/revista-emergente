---
description: "Plan técnico de implementación — CÓMO se construye Revista Emergente"
type: plan
spec: specs/001-revista-emergente/spec.md
date: 2026-04-26
---

# Plan de Implementación — Revista Emergente

**Input:** `spec.md` (requisitos funcionales)  
**Output:** `tasks.md` (tareas ordenadas de implementación)

---

## Constitution Check

| Principio | Estado |
|---|---|
| Tipografía: solo Bebas Neue, Anton, Space Mono, Barlow Condensed | ✅ Aplicado en `tailwind.config.js` |
| JWT en httpOnly cookie | ✅ Diseñado así desde el inicio |
| Queries SQL parametrizadas (sin ORM pesado) | ✅ `pg` raw SQL |
| Uploads: solo jpg/png/webp, max 5MB, UUID rename | ✅ Multer + validación MIME |
| React 18 + Tailwind v3 + Framer Motion v11 | ✅ Stack definido |
| Un solo usuario admin (seed script) | ✅ No hay registro público |

---

## Entorno de desarrollo local

### PostgreSQL

Instalado via **Scoop** (no está en PATH del sistema por defecto).

| Ítem | Valor |
|---|---|
| Versión | 18.3 |
| Binarios | `C:\Users\gianl\scoop\apps\postgresql\18.3\bin\` |
| Data dir | `C:\Users\gianl\scoop\persist\postgresql\data` |
| Usuario app | `emergente_user` / `emergente_dev_2026` |
| Base de datos | `emergente_db` |
| DATABASE_URL | `postgresql://emergente_user:emergente_dev_2026@127.0.0.1:5432/emergente_db` |

**Agregar al PATH del sistema:** `C:\Users\gianl\scoop\apps\postgresql\18.3\bin`

**El servidor NO arranca automáticamente.** Iniciarlo antes de correr migraciones o el backend:

```powershell
$pgBin = "C:\Users\gianl\scoop\apps\postgresql\18.3\bin"
$pgData = "$env:USERPROFILE\scoop\persist\postgresql\data"
& "$pgBin\pg_ctl.exe" -D $pgData start
```

Conectar como superusuario (sin password via 127.0.0.1):
```powershell
& "C:\Users\gianl\scoop\apps\postgresql\18.3\bin\psql.exe" -U postgres -h 127.0.0.1
```

---

## Contexto técnico

| Área | Decisión |
|---|---|
| **Node.js** | 20.x LTS (via NVM) |
| **PostgreSQL** | 15 |
| **React** | 18 con Vite (no CRA) |
| **Tailwind** | v3 — config extendida con la paleta y fuentes del proyecto |
| **Editor de contenido** | TipTap v2 (bold, italic, headings H1-H4, links, imágenes inline) |
| **Estado global** | Zustand v4 (solo para auth state en admin) |
| **Routing** | React Router v6 |
| **Animaciones** | Framer Motion v11 + CSS keyframes para marquee |
| **Formularios** | React Hook Form v7 + Zod v3 (validación client-side) |
| **HTTP** | Axios v1 con interceptor para manejar 401 globalmente |
| **Auth** | JWT, expiración 7 días, cookie httpOnly SameSite=Strict |
| **Testing** | Sin test suite en v1 (MVP — una sola dev) |

---

## Estructura de carpetas

```
revista-emergente/
├── client/                    # React + Vite frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/            # Fuentes locales, SVGs, texturas de grano
│   │   ├── components/
│   │   │   ├── ui/            # Botones, cards, badges, skeleton loaders
│   │   │   ├── layout/        # Navbar, Footer, Layout wrapper
│   │   │   └── sections/      # HeroSection, PublicationGrid, PodcastBanner, etc.
│   │   ├── pages/             # Páginas del sitio público
│   │   ├── admin/
│   │   │   ├── pages/         # Dashboard, Publicaciones, Artistas, etc.
│   │   │   └── components/    # PublicationEditor, ArtistForm, ContactDrawer
│   │   ├── hooks/             # useAuth, useIntersectionObserver, usePublications
│   │   ├── services/          # api.js (axios instance), publications.js, etc.
│   │   ├── store/             # authStore.js (Zustand)
│   │   ├── utils/             # slugify, formatDate, sanitizeHTML
│   │   └── App.jsx
│   ├── tailwind.config.js     # Paleta emergente + fuentes
│   └── vite.config.js
│
├── server/                    # Node.js + Express
│   ├── src/
│   │   ├── controllers/       # publicationsController.js, authController.js, etc.
│   │   ├── routes/            # auth.routes.js, publications.routes.js, etc.
│   │   ├── models/            # queries SQL reutilizables por entidad
│   │   ├── middleware/        # authMiddleware.js, uploadMiddleware.js, rateLimiter.js
│   │   ├── services/          # emailService.js (notificaciones opcionales v1)
│   │   └── app.js             # Express setup, middlewares globales, rutas
│   ├── migrations/            # 001_initial_schema.sql, 002_seed_categories.sql
│   ├── scripts/               # seed-admin.js
│   ├── uploads/               # gitignored
│   └── package.json
│
├── specs/                     # Spec-kit (este directorio)
├── nginx/
│   └── emergente.conf
├── ecosystem.config.js        # PM2
├── .env.example
└── README.md
```

---

## Arquitectura del sistema

```
Internet
    │
    ▼
NGINX (puerto 80/443)
    ├── / → servir /var/www/emergente/client/dist (React build estático)
    ├── /api/ → proxy_pass http://localhost:3001 (Express)
    └── /uploads/ → alias /var/www/emergente/server/uploads/ (archivos estáticos)
    
Express (localhost:3001, gestionado por PM2)
    └── PostgreSQL (localhost:5432, solo accesible localmente)
```

**Por qué NGINX sirve el frontend:** React build es estático. NGINX es más eficiente para archivos estáticos que Node.js. Separación clara entre static serving y API.

**Por qué PostgreSQL local:** Single-tenant, una sola admin. No necesita RDS ni managed DB en v1. Menor latencia, menor costo.

---

## NGINX — configuración

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

    location / {
        root /var/www/emergente/client/dist;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads/ {
        alias /var/www/emergente/server/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    client_max_body_size 10M;
}
```

---

## Variables de entorno

```env
# server/.env
PORT=3001
NODE_ENV=production

DATABASE_URL=postgresql://emergente_user:PASSWORD@localhost:5432/emergente_db

JWT_SECRET=<random 64+ chars>
JWT_EXPIRES_IN=7d

UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880    # 5MB

# Opcionales — notificaciones email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NOTIFY_EMAIL=admin@revistaemergente.ar
```

---

## PM2

```js
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'emergente-api',
    script: './server/src/app.js',
    env_production: { NODE_ENV: 'production' },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '512M'
  }]
}
```

---

## Express — setup y middlewares globales

**Orden de middlewares en `app.js`:**
1. `helmet()` — headers de seguridad (CSP, X-Frame-Options, etc.)
2. `cors({ origin: process.env.FRONTEND_URL, credentials: true })`
3. `express.json({ limit: '1mb' })`
4. `cookieParser()`
5. Rutas de rate limiting (aplicadas por ruta, no globalmente)
6. Rutas de la API
7. Handler de errores global (404 catch-all + 500 error handler)

---

## Tailwind config — extensiones del proyecto

```js
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{jsx,js}'],
  theme: {
    extend: {
      colors: {
        rojo:      '#C0001A',
        negro:     '#0A0A0A',
        blanco:    '#F5F0EB',
        gris:      '#1A1A1A',
        'gris-mid':'#3A3A3A',
      },
      fontFamily: {
        display:  ['Bebas Neue', 'sans-serif'],
        titulo:   ['Anton', 'sans-serif'],
        mono:     ['Space Mono', 'monospace'],
        ui:       ['Barlow Condensed', 'sans-serif'],
      },
    },
  },
}
```

---

## Componentes clave — diseño técnico

### `<Navbar />`
- Estado scroll via `useEffect` + `window.addEventListener('scroll')`
- `transparent → bg-negro` al pasar 80px de scroll
- Mobile: state booleano `menuOpen` → overlay full-screen con Framer Motion `AnimatePresence`
- Logo: texto "EMERGENTE" en `font-display` (Bebas Neue)

### `<PublicationCard />`
- Props: `{ title, subtitle, category, coverImage, slug, date }`
- Hover: `group` de Tailwind + `group-hover:scale-105` en img + overlay rojo `group-hover:opacity-100`
- Badge de categoría: `bg-rojo text-negro` pill

### `<CategoryFilter />`
- State interno + callback `onFilterChange`
- Botón activo: `bg-rojo text-negro`. Inactivo: `border border-gris-mid text-blanco`

### `<TipTapEditor />` (admin)
- Extensions: StarterKit, Link, Image (con upload handler)
- Al insertar imagen desde el editor: llama a `POST /api/admin/upload` primero

### `<ProtectedRoute />` (admin)
- Verifica `GET /api/auth/me` al montar
- Si 401: redirige a `/admin/login`
- Zustand store guarda `{ user, isAuthenticated }`

---

## Animaciones — implementación técnica

### Hero: letras de "EMERGENTE"

Framer Motion `staggerChildren`:

```jsx
const container = {
  animate: { transition: { staggerChildren: 0.08 } }
};
const letter = {
  initial: { y: 60, opacity: 0 },
  animate: { 
    y: 0, opacity: 1,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};
```

Glitch post-entrada: CSS animation `@keyframes glitch` en `::before`/`::after` pseudo-elementos, triggered via clase JS 600ms después del stagger.

### Efecto glitch en hover (logo y títulos grandes)

```css
.glitch:hover::before {
  content: attr(data-text);
  position: absolute;
  left: 2px;
  color: #C0001A;
  clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
  animation: glitch-clip 0.3s ease forwards;
}
.glitch:hover::after {
  content: attr(data-text);
  position: absolute;
  left: -2px;
  color: #F5F0EB;
  clip-path: polygon(0 55%, 100% 55%, 100% 100%, 0 100%);
  animation: glitch-clip 0.3s ease forwards;
}
```

### Cards al entrar al viewport

Custom hook `useIntersectionObserver`:
- `IntersectionObserver` con `threshold: 0.1`
- Agrega clase `is-visible` al entrar
- CSS: `.card { opacity: 0; transform: translateY(20px); transition: all 400ms; }`
- `.card.is-visible { opacity: 1; transform: translateY(0); }`
- Stagger entre cards del mismo grupo: `transition-delay: calc(var(--index) * 100ms)`

### Marquee en banner podcast

```css
@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}
.marquee-inner {
  animation: marquee 40s linear infinite;
  white-space: nowrap;
}
```

Contenido duplicado (`ESCUCHÁ EL PODCAST · ` × N) para loop seamless.

### Cursor personalizado (desktop)

```jsx
// Solo en dispositivos que soportan hover (media query prefers-hover: hover)
// Div absoluto fixed, z-index alto
// state: { x, y, hovered }
// onMouseMove → setState
// hovered → toggle clase que agranda el cursor
```

### Transiciones de página

```jsx
// React Router + Framer Motion AnimatePresence
<AnimatePresence mode="wait">
  <motion.div
    key={location.pathname}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.2 }}
  >
    <Outlet />
  </motion.div>
</AnimatePresence>
```

---

## Seguridad — medidas de implementación

| Área | Implementación |
|---|---|
| **Auth JWT** | `jsonwebtoken` sign/verify. Cookie: `httpOnly: true, secure: true, sameSite: 'strict'`. Expiración 7d. |
| **Passwords** | `bcrypt.hash(password, 12)` al crear. `bcrypt.compare()` al login. |
| **Uploads** | Multer `fileFilter` verifica `file.mimetype` ∈ `['image/jpeg','image/png','image/webp']`. `path.extname()` validado. UUID via `crypto.randomUUID()`. |
| **SQL** | Nunca template literals en queries. Siempre `$1, $2` placeholders con `pg`. |
| **CORS** | `origin: process.env.FRONTEND_URL` (ej: `https://revistaemergente.ar`). `credentials: true`. |
| **Rate limit login** | `express-rate-limit`: max 5, windowMs 15*60*1000, skip para status 200. |
| **Rate limit contacto** | max 3 por IP por hora. |
| **Helmet** | Default config + `contentSecurityPolicy` customizado para Google Fonts y /uploads. |
| **Validación server** | Cada endpoint admin valida campos requeridos. No confiar en validación client-side. |

---

## Flujo de deployment

```bash
# Desde local — build y push
cd client && npm run build
rsync -avz dist/ user@vps:/var/www/emergente/client/dist/

# En el VPS
git pull origin main
cd server && npm install --production
pm2 restart emergente-api
```

Alternativa recomendada en el futuro: GitHub Actions CI/CD (fuera de scope v1).

---

## Decisiones de arquitectura — justificación

| Decisión | Alternativa descartada | Razón |
|---|---|---|
| `pg` raw SQL | Prisma / Sequelize | Menor abstracción, queries predecibles, sin magic. El schema es simple. |
| JWT en cookie httpOnly | JWT en localStorage | Protección contra XSS. Cookie httpOnly no es accesible por JS. |
| Vite en lugar de CRA | Create React App | CRA discontinuado. Vite es más rápido y moderno. |
| Zustand | Redux | La app admin es simple. Redux sería overengineering. |
| JSONB para galería en shows | Tabla separada `show_photos` | La galería es solo un array de paths. Tabla separada añade complejidad sin beneficio. |
| Sin test suite en v1 | Jest + Playwright | Una sola dev, MVP rápido. Los tests se agregan post-lanzamiento. |

---

## Dependencias principales

### Frontend (`client/`)
```json
{
  "react": "^18",
  "react-router-dom": "^6",
  "framer-motion": "^11",
  "tailwindcss": "^3",
  "@tiptap/react": "^2",
  "@tiptap/starter-kit": "^2",
  "@tiptap/extension-link": "^2",
  "@tiptap/extension-image": "^2",
  "react-hook-form": "^7",
  "zod": "^3",
  "@hookform/resolvers": "^3",
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
  "cookie-parser": "^1",
  "express-rate-limit": "^7",
  "dotenv": "^16",
  "uuid": "^9"
}
```
