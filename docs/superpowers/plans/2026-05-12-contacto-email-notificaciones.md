# Notificaciones por email del formulario de contacto — Plan de Implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Que cada envío del formulario público de contacto dispare un email de aviso a la casilla configurada en `NOTIFY_EMAIL`.

**Architecture:** Nuevo módulo `server/src/services/mailer.js` que crea un transporter SMTP de `nodemailer` desde las variables `SMTP_*` y expone `sendContactNotification(contact)`. El controller `contactController.submit` lo invoca después de persistir en DB, dentro de un `try/catch` que loguea pero nunca cambia la respuesta `201`. Si `SMTP_HOST` está vacío, el envío se omite con un warning (dev funciona sin SMTP).

**Tech Stack:** Node 20 (ESM), Express, `nodemailer`, `node:test`.

**Spec de referencia:** `docs/superpowers/specs/2026-05-12-contacto-email-notificaciones-design.md`

---

## File Structure

- `server/package.json` — agregar `nodemailer` a `dependencies` (vía `npm install`).
- `server/src/services/mailer.js` — **nuevo.** `getTransporter()` + `sendContactNotification(contact, transporter?)`.
- `server/src/services/mailer.test.js` — **nuevo.** Tests del módulo mailer con transporter inyectado.
- `server/src/controllers/contactController.js` — modificar `submit()` para invocar `sendContactNotification`.
- `.env.example` — agregar línea `MAIL_FROM=` y comentario sobre `SMTP_PORT`.

---

## Task 1: Agregar la dependencia `nodemailer`

**Files:**
- Modify: `server/package.json` (y `server/package-lock.json`, generado por npm)

- [ ] **Step 1: Instalar nodemailer**

Run:
```bash
cd server && npm install nodemailer
```
Expected: `package.json` ahora lista `"nodemailer"` en `dependencies`; `package-lock.json` actualizado; sin errores.

- [ ] **Step 2: Verificar que quedó instalado**

Run:
```bash
cd server && node -e "import('nodemailer').then(m => console.log(typeof m.default.createTransport))"
```
Expected: imprime `function`.

- [ ] **Step 3: Commit**

```bash
git add server/package.json server/package-lock.json
git commit -m "chore(server): add nodemailer dependency"
```

---

## Task 2: Módulo `mailer.js` (TDD)

**Files:**
- Create: `server/src/services/mailer.js`
- Test: `server/src/services/mailer.test.js`

- [ ] **Step 1: Escribir el test que falla**

Create `server/src/services/mailer.test.js`:

```js
import { test } from 'node:test';
import assert from 'node:assert/strict';

test('sendContactNotification arma el mensaje con to/from/replyTo/subject/text', async () => {
  process.env.NOTIFY_EMAIL = 'destino@test.local';
  process.env.MAIL_FROM = 'noreply@test.local';
  const { sendContactNotification } = await import('./mailer.js');

  let captured;
  const fakeTransporter = {
    sendMail: async (msg) => { captured = msg; return { messageId: 'fake' }; },
  };

  await sendContactNotification(
    { name: 'Ana', email: 'ana@example.com', project_name: 'Proyecto X', message: '¡Hola!', instagram: '@ana' },
    fakeTransporter,
  );

  assert.equal(captured.to, 'destino@test.local');
  assert.equal(captured.from, 'noreply@test.local');
  assert.equal(captured.replyTo, 'ana@example.com');
  assert.match(captured.subject, /Ana/);
  assert.match(captured.text, /¡Hola!/);
  assert.match(captured.text, /Proyecto X/);
  assert.match(captured.text, /@ana/);
  assert.match(captured.text, /ana@example\.com/);
});

test('sendContactNotification muestra "—" cuando faltan campos opcionales', async () => {
  process.env.NOTIFY_EMAIL = 'destino@test.local';
  const { sendContactNotification } = await import('./mailer.js');

  let captured;
  const fakeTransporter = { sendMail: async (msg) => { captured = msg; return {}; } };

  await sendContactNotification({ name: 'Beto', email: 'beto@example.com', message: 'm' }, fakeTransporter);
  assert.match(captured.text, /Proyecto:\s+—/);
  assert.match(captured.text, /Instagram:\s+—/);
});

test('getTransporter() devuelve null si SMTP_HOST está vacío', async () => {
  const original = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  const { getTransporter } = await import('./mailer.js');
  assert.equal(getTransporter(), null);
  if (original !== undefined) process.env.SMTP_HOST = original;
});

test('sendContactNotification sin SMTP configurado no lanza', async () => {
  const original = process.env.SMTP_HOST;
  delete process.env.SMTP_HOST;
  const { sendContactNotification } = await import('./mailer.js');
  await sendContactNotification({ name: 'X', email: 'x@e.com', message: 'm' }); // usa getTransporter() => null
  if (original !== undefined) process.env.SMTP_HOST = original;
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run:
```bash
cd server && node --test src/services/mailer.test.js
```
Expected: FAIL — `Cannot find module './mailer.js'` (el módulo todavía no existe).

- [ ] **Step 3: Crear `mailer.js`**

Create `server/src/services/mailer.js`:

```js
import nodemailer from 'nodemailer';

/**
 * Crea un transporter SMTP a partir de las variables de entorno.
 * @returns {import('nodemailer').Transporter|null} null si SMTP_HOST no está configurado.
 */
export function getTransporter() {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  const port = Number(process.env.SMTP_PORT) || 587;
  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 = TLS implícito; 587/25 = STARTTLS
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
}

/**
 * Envía a NOTIFY_EMAIL la notificación de una nueva solicitud de contacto.
 * Si SMTP no está configurado, loguea un warning y no hace nada.
 * @param {{ name: string, email: string, project_name?: string, message: string, instagram?: string }} contact
 * @param {import('nodemailer').Transporter|{sendMail: Function}} [transporter] inyectable para tests.
 */
export async function sendContactNotification(contact, transporter = getTransporter()) {
  if (!transporter) {
    console.warn('[mailer] SMTP no configurado — se omite la notificación de contacto');
    return;
  }

  const { name, email, project_name, message, instagram } = contact;
  const text = [
    `Nueva solicitud de contacto — ${new Date().toISOString()}`,
    '',
    `Nombre:    ${name}`,
    `Email:     ${email}`,
    `Proyecto:  ${project_name || '—'}`,
    `Instagram: ${instagram || '—'}`,
    '',
    'Mensaje:',
    message,
  ].join('\n');

  await transporter.sendMail({
    to: process.env.NOTIFY_EMAIL,
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    replyTo: email,
    subject: `[Emergente] Nueva solicitud de contacto — ${name}`,
    text,
  });
}
```

- [ ] **Step 4: Correr el test y verificar que pasa**

Run:
```bash
cd server && node --test src/services/mailer.test.js
```
Expected: PASS — los 4 tests en verde.

- [ ] **Step 5: Commit**

```bash
git add server/src/services/mailer.js server/src/services/mailer.test.js
git commit -m "feat(server): add mailer service for contact notifications"
```

---

## Task 3: Wire en `contactController.submit`

**Files:**
- Modify: `server/src/controllers/contactController.js`

No hay suite de tests de controllers en el repo y testear esto requeriría DB + mocks de ESM; la lógica de email queda cubierta por `mailer.test.js`. La verificación de este task es manual (Step 3).

- [ ] **Step 1: Editar el controller**

En `server/src/controllers/contactController.js`:

1. Agregar el import al inicio (debajo del import de `Contact`):

```js
import * as Contact from '../models/contact.js';
import { sendContactNotification } from '../services/mailer.js';
```

2. Reemplazar el cuerpo de `submit()` para que quede así:

```js
export async function submit(req, res) {
  try {
    const { name, email, message, project_name, instagram } = req.body;

    if (!name || !email || !message) {
      return res.status(422).json({ error: 'nombre, email y mensaje son requeridos' });
    }

    await Contact.create({ name, email, project_name, message, instagram });

    try {
      await sendContactNotification({ name, email, project_name, message, instagram });
    } catch (mailErr) {
      console.error('[contactController] fallo al enviar notificación de contacto:', mailErr);
    }

    return res.status(201).json({
      message: 'Solicitud enviada. Te contactaremos a la brevedad.',
    });
  } catch (err) {
    console.error('[contactController] submit error:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
```

(El resto del archivo — `listAdmin`, `updateStatus`, `VALID_STATUSES` — no cambia.)

- [ ] **Step 2: Verificar que la suite completa sigue verde**

Run:
```bash
cd server && npm test
```
Expected: todos los tests pasan (incluye `mailer.test.js`, `teamMembers.test.js`, `migrate.test.js`). Nota: la suite necesita la DB local levantada; si `teamMembers`/`migrate` fallan por DB, correr al menos `node --test src/services/mailer.test.js` y dejar constancia.

- [ ] **Step 3: Smoke test manual**

Sin SMTP configurado (`.env` sin `SMTP_HOST`):
```bash
cd server && npm start
# en otra terminal:
curl -s -X POST http://localhost:3001/api/contact -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","message":"hola"}'
```
Expected: respuesta `{"message":"Solicitud enviada. Te contactaremos a la brevedad."}` y en los logs del server aparece `[mailer] SMTP no configurado — se omite la notificación de contacto`. La fila se inserta igual en `contact_requests`.

- [ ] **Step 4: Commit**

```bash
git add server/src/controllers/contactController.js
git commit -m "feat(server): notify NOTIFY_EMAIL on contact form submission"
```

---

## Task 4: Actualizar `.env.example`

**Files:**
- Modify: `.env.example`

- [ ] **Step 1: Editar el bloque de email**

En `.env.example`, reemplazar el bloque actual:

```
# Opcional — notificaciones email
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
NOTIFY_EMAIL=admin@revistaemergente.ar
```

por:

```
# Opcional — notificaciones email del formulario de contacto
# SMTP_PORT: 465 = TLS implícito (secure); 587 = STARTTLS. Si SMTP_HOST queda vacío, no se envían mails.
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
# From del mail (algunos SMTP exigen que coincida con SMTP_USER). Si vacío, usa SMTP_USER.
MAIL_FROM=
# Destino de las notificaciones de contacto.
NOTIFY_EMAIL=admin@revistaemergente.ar
```

- [ ] **Step 2: Commit**

```bash
git add .env.example
git commit -m "docs: document MAIL_FROM and SMTP_PORT in .env.example"
```

---

## Done when

- `POST /api/contact` sigue devolviendo `201` siempre.
- Con SMTP configurado, llega un mail a `NOTIFY_EMAIL` con `replyTo` apuntando al remitente.
- Sin SMTP configurado, el form funciona y solo aparece el warning en logs.
- `mailer.test.js` en verde.
