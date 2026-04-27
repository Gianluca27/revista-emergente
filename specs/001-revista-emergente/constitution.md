---
description: "Principios rectores inamovibles del proyecto Revista Emergente"
type: constitution
version: "1.0"
date: 2026-04-26
---

# Constitución del Proyecto — Revista Emergente

> Esta constitución define los principios que gobiernan toda decisión de diseño, desarrollo y deployment. Ningún PR puede violarlos sin enmienda explícita documentada.

---

## Artículo I — Identidad visual (no negociable)

La identidad visual **es** el producto. No es decoración. Está prohibido degradarla.

### Paleta de colores

```css
--color-rojo:      #C0001A;   /* Rojo Emergente — acento principal */
--color-negro:     #0A0A0A;   /* Fondo oscuro */
--color-blanco:    #F5F0EB;   /* Blanco roto / crudo */
--color-gris:      #1A1A1A;   /* Cards, superficies elevadas */
--color-gris-mid:  #3A3A3A;   /* Bordes, separadores */
```

### Tipografía

| Uso | Familia | Fuente |
|---|---|---|
| Display / Hero | **Bebas Neue** | Google Fonts |
| Títulos secundarios | **Anton** | Google Fonts |
| Cuerpo de texto | **Space Mono** | Google Fonts |
| UI / Labels | **Barlow Condensed** | Google Fonts |

**PROHIBIDO:** Arial, Inter, Roboto, Helvetica, ni ninguna fuente de sistema. La tipografía es identidad.

### Estética general

- Fondo negro/oscuro predominante en todas las páginas
- Texto en blanco roto (`#F5F0EB`) o rojo (`#C0001A`)
- Texturas de grano sutil (3–5% de opacidad) sobre fondos oscuros — efecto fanzine/fotocopia
- Bordes y cortes asimétricos, elementos que "rompen" la grilla
- Imágenes en alto contraste; filtro rojo duotone permitido
- Hover states con personalidad: rojo, underlines gruesos

---

## Artículo II — Stack tecnológico (inamovible)

| Capa | Tecnología |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS v3 |
| Animaciones | Framer Motion v11 |
| Editor de contenido | TipTap v2 |
| Estado global | Zustand v4 |
| Formularios | React Hook Form v7 + Zod v3 |
| HTTP client | Axios v1 |
| Backend | Node.js 20 + Express v4 |
| Base de datos | PostgreSQL 15 |
| ORM/Queries | `pg` (raw SQL parametrizado — sin ORM pesado) |
| Auth | JWT (httpOnly cookies — nunca localStorage) |
| Upload | Multer v1 |
| Infraestructura | VPS Hetzner + NGINX + PM2 + Let's Encrypt |

Cambiar de stack requiere enmienda constitucional con justificación escrita.

---

## Artículo III — Seguridad (no negociable)

- JWT almacenado **exclusivamente** en httpOnly cookies. Nunca en localStorage ni sessionStorage.
- Passwords hasheados con bcrypt, salt rounds mínimo 12.
- Queries SQL **siempre parametrizadas**. String interpolation = rechazo de PR.
- Uploads validados por MIME type en servidor (solo jpg, png, webp). Renombrado con UUID.
- CORS restringido al origen del frontend en producción.
- Rate limiting en login (5 intentos / 15 min) y contacto.
- Helmet.js activo en todas las respuestas HTTP.
- Variables sensibles **nunca** en el repositorio. Solo en `.env`.

---

## Artículo IV — Calidad de datos

- Un solo usuario administradora (seed script, nunca registro público).
- Slugs únicos para publications, artists, shows.
- `status` en todas las entidades de contenido: siempre `'draft'` por defecto.
- Contenido nunca eliminado físicamente si tiene relaciones activas (usar CASCADE con cuidado).

---

## Artículo V — Experiencia de usuario

- El sitio debe funcionar sin JavaScript para contenido estático (progressive enhancement donde sea posible).
- Mobile-first en todos los componentes.
- Imágenes con lazy loading por defecto.
- Tamaño máximo de upload: 5MB. Rechazar con mensaje claro en cliente y servidor.
- Toda acción destructiva en el panel admin requiere confirmación explícita.

---

## Artículo VI — Gobierno del proyecto

- Cualquier PR que viole esta constitución debe documentar la justificación y la alternativa más simple que fue rechazada.
- La Apéndice A del SDD (dependencias) define las versiones mínimas. No actualizar sin test.
- El dominio canónico es `revistaemergente.ar`. Toda URL externa usa HTTPS.
