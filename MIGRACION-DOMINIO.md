# Migración a dominio propio

Documento para reconfigurar el deployment cuando se adquiera un dominio propio (ej: `revistaemergente.ar`).

## Estado actual del deployment

- **Frontend:** Vercel (URL `*.vercel.app`)
- **Backend:** Coolify en VPS Hetzner (IP `159.69.6.77`), expuesto vía `https://revista-emergente.duckdns.org`
- **Base de datos:** PostgreSQL 18 en container Coolify (red interna, hostname `q75yeka0chefx83f8tqnbsqz`)
- **Reverse proxy:** Traefik (gestionado por Coolify, SSL automático con Let's Encrypt)
- **DNS provisional:** DuckDNS apuntando a la IP del VPS

## Arquitectura objetivo (con dominio propio)

Asumiendo dominio `revistaemergente.ar`:

- `revistaemergente.ar` y `www.revistaemergente.ar` → Vercel (frontend)
- `api.revistaemergente.ar` → VPS Hetzner (backend)

Subdominio separado para la API es la práctica recomendada — separa concerns, simplifica routing, certificados independientes.

---

## Pasos de migración

### 1. Configurar DNS en el registrar del dominio

Crear estos registros:

| Tipo | Nombre | Valor | TTL |
|------|--------|-------|-----|
| A | `@` (raíz) | IP que Vercel indique en su panel | 3600 |
| CNAME | `www` | `cname.vercel-dns.com` | 3600 |
| A | `api` | `159.69.6.77` (IP del VPS) | 3600 |

Vercel da las instrucciones exactas al agregar el dominio (paso 2). La IP/CNAME del registro raíz puede variar según el registrar.

Esperar propagación: 5 min a 1 hora. Verificar con:
```bash
dig api.revistaemergente.ar
dig revistaemergente.ar
```

### 2. Vercel — agregar dominio custom al frontend

1. Vercel → Project Settings → **Domains** → Add
2. Agregar `revistaemergente.ar` y `www.revistaemergente.ar`
3. Vercel verifica los DNS automáticamente y emite SSL
4. Configurar redirect de `www` a raíz (o viceversa) según preferencia

### 3. Vercel — actualizar variable de entorno

Settings → Environment Variables, editar:

```
VITE_API_URL=https://api.revistaemergente.ar/api
```

(antes era `https://revista-emergente.duckdns.org/api`)

**Redeploy** del frontend para aplicar el cambio (Vercel no aplica env vars sin redeploy).

### 4. Coolify — actualizar dominio del backend

1. Coolify → Project `Revista Emergente` → app `revista-emergente:main-...`
2. Tab **Configuration** → sección **General** → campo **Domains**
3. Cambiar `https://revista-emergente.duckdns.org` por `https://api.revistaemergente.ar`
4. **Save**

Traefik detecta el cambio y solicita un nuevo certificado de Let's Encrypt automáticamente. Esta vez **no** aparece el warning de rate-limit porque ya no es un dominio compartido como sslip.io o duckdns.org.

### 5. Coolify — actualizar variable de entorno del backend

En la misma app → **Environment Variables**, editar:

```
FRONTEND_URL=https://revistaemergente.ar
```

(antes apuntaba a la URL `.vercel.app`)

Esta variable controla CORS — debe coincidir exactamente con el origen desde el que llamará el frontend. Si se usa también `www`, considerar agregar lógica multi-origen en `server/src/app.js` o configurar redirect estricto a la versión sin `www` en Vercel.

### 6. Coolify — redeploy del backend

Click **Deploy** para aplicar las nuevas variables.

Verificar logs: debe levantar sin errores y mostrar `Server running on port 3001`.

### 7. Verificación end-to-end

Desde local:
```bash
curl -v https://api.revistaemergente.ar/api/health
```

Esperar: HTTP 200, header `access-control-allow-origin: https://revistaemergente.ar`, certificado válido emitido para `api.revistaemergente.ar`.

Desde el browser: abrir `https://revistaemergente.ar`, intentar login en `/admin/login`. Debe funcionar sin errores CORS.

### 8. Limpieza (opcional, después de verificar)

- Eliminar dominio en DuckDNS (`revista-emergente.duckdns.org`) — ya no lo necesita Coolify
- O dejarlo como fallback si querés tener un acceso de emergencia

---

## Lo que NO hay que tocar

- **Código del repo** — todo se maneja por env vars. No hay URLs hardcoded.
  - `client/src/services/api.js` lee `VITE_API_URL` con fallback a localhost (solo dev)
  - `server/src/app.js` lee `FRONTEND_URL` para CORS
- **VPS directo** (SSH) — todo lo gestiona Coolify + Traefik
- **PostgreSQL** — sigue corriendo en la misma red interna de Docker, hostname interno no cambia
- **Otros servicios en Coolify** — Pocketbase y demás no se ven afectados
- **`nginx/emergente.conf` del repo** — quedó obsoleto desde que migramos a Coolify (Traefik reemplaza Nginx). Mantener por referencia o borrar.

---

## Variables de entorno — referencia consolidada

### Vercel (frontend)
```
VITE_API_URL=https://api.revistaemergente.ar/api
```

### Coolify — app backend (`revista-emergente:main-...`)
```
PORT=3001
NODE_ENV=production
DATABASE_URL=postgres://emergente_user:<PASS>@q75yeka0chefx83f8tqnbsqz:5432/emergente_db
JWT_SECRET=<random-64-chars>
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://revistaemergente.ar
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

`DATABASE_URL` no cambia — es interno a Docker.

### Coolify — db (`emergente-db`)
```
POSTGRES_USER=emergente_user
POSTGRES_PASSWORD=<misma-pass-que-DATABASE_URL>
POSTGRES_DB=emergente_db
```

---

## Notas de incidencias previas (para evitar repetir)

1. **Postgres del host vs Docker:** intentamos primero usar Postgres instalado en el host (apt). No funciona porque el container Docker no llega a `localhost` del host. Se descartó y se usa Postgres como servicio Coolify (mismo Docker network que la app). Si en algún momento se considera volver al Postgres del host, hay que abrir el firewall, configurar `pg_hba.conf` y `postgresql.conf` para escuchar en la red Docker (`172.17.0.0/16`).

2. **PostgreSQL 15+ y schema public:** los `GRANT` no son suficientes — hay que hacer al usuario **owner** del schema `public`:
   ```sql
   ALTER DATABASE emergente_db OWNER TO emergente_user;
   \c emergente_db
   ALTER SCHEMA public OWNER TO emergente_user;
   ```

3. **Container ID confusion:** el container de la **app** (Node) y el de la **DB** (Postgres) son distintos. Para correr scripts Node (`seed-admin.js`) hay que usar el container de la app, no el de la DB. Identificar por imagen:
   - DB: `postgres:18-alpine`
   - App: `tmqfz1cg53fe4eu18uir7bek:<hash>`

4. **sslip.io + HTTPS:** Coolify advierte (correctamente) que sslip.io con Let's Encrypt está rate-limited. Por eso DuckDNS funciona como fallback gratuito y un dominio propio es la solución definitiva.

5. **Vercel env vars requieren redeploy:** cualquier cambio en `VITE_API_URL` no se aplica hasta que se redeploy.

6. **Puerto 80 ocupado:** el VPS tiene Traefik (Coolify) escuchando en 80/443. No intentar instalar Nginx system-wide — chocan. Todo el routing pasa por Traefik vía Coolify.

7. **CORS con preview deployments de Vercel:** si se prueba desde un preview URL (`*-git-branch.vercel.app`), CORS lo bloquea porque solo el origin de producción está en `FRONTEND_URL`. Para testear, usar el production URL o agregar lógica multi-origen al backend.

---

## Comandos útiles de referencia

### Listar containers
```bash
docker ps --format "table {{.ID}}\t{{.Names}}\t{{.Image}}"
```

### Entrar a la DB
```bash
docker exec -it <db-container-id> psql -U postgres -d emergente_db
```

### Crear/regenerar admin
```bash
docker exec -it <app-container-id> node scripts/seed-admin.js --email <email> --password <pass>
```

### Ver logs del backend
En Coolify → app → tab **Logs**, o:
```bash
docker logs <app-container-id> --tail 100 -f
```

### Verificar conectividad API
```bash
curl -v https://api.revistaemergente.ar/api/health
```
