# Notificaciones por email del formulario de contacto — Diseño

**Fecha:** 2026-05-12
**Estado:** Aprobado, pendiente de plan de implementación

## Problema

El formulario público de contacto (`POST /api/contact`) hoy solo persiste la
solicitud en la tabla `contact_requests`. Las variables `SMTP_*` y `NOTIFY_EMAIL`
del `.env.example` son scaffold sin uso. Se quiere que, al enviarse un formulario,
llegue un email de aviso a la casilla configurada en `NOTIFY_EMAIL`.

## Decisiones tomadas

- **Provider:** SMTP genérico vía `nodemailer`, leyendo `SMTP_HOST/PORT/USER/PASS`.
  Mantiene el contrato de `.env.example` ya existente; funciona con Gmail
  (app password), Mailgun, el SMTP del VPS, etc.
- **Fallo de envío:** el formulario igual responde `201`. La DB / panel admin son
  la fuente de verdad. Un fallo de SMTP se loguea (`console.error`) pero no afecta
  la respuesta al usuario.
- **Email de confirmación al remitente:** no. Solo se manda la notificación a
  `NOTIFY_EMAIL`.
- **SMTP no configurado** (`SMTP_HOST` vacío): se omite el envío con un
  `console.warn`, sin error — así el entorno de desarrollo funciona sin SMTP.

## Arquitectura

### Nuevo módulo: `server/src/services/mailer.js`

- `getTransporter()` — crea (y memoiza) un transporter de nodemailer:
  `nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: <port === 465>, auth: { user: SMTP_USER, pass: SMTP_PASS } })`.
  Si `SMTP_HOST` está vacío, devuelve `null`.
- `sendContactNotification(contact, transporter = getTransporter())`
  - `contact`: `{ name, email, project_name, message, instagram }`.
  - Si `transporter` es `null` → `console.warn('[mailer] SMTP no configurado, se omite notificación')` y retorna.
  - Si no, arma el mensaje y hace `await transporter.sendMail(...)`.
  - El parámetro `transporter` inyectable existe para tests.

### Contenido del email

| Campo     | Valor                                                            |
|-----------|------------------------------------------------------------------|
| `to`      | `process.env.NOTIFY_EMAIL`                                       |
| `from`    | `process.env.MAIL_FROM || process.env.SMTP_USER`                 |
| `replyTo` | `contact.email` (el email cargado en el form)                    |
| `subject` | `[Emergente] Nueva solicitud de contacto — ${contact.name}`      |
| `text`    | Texto plano con: nombre, email, proyecto, instagram, mensaje, timestamp ISO. Campos opcionales vacíos se muestran como `—`. |

Sin HTML — solo `text`.

### Wiring en `contactController.submit`

Después de que `Contact.create(...)` resuelve OK y antes de `res.status(201)`:

```js
try {
  await sendContactNotification({ name, email, project_name, message, instagram });
} catch (err) {
  console.error('[contactController] fallo al enviar notificación de contacto:', err);
}
return res.status(201).json({ message: 'Solicitud enviada. Te contactaremos a la brevedad.' });
```

El error de email nunca cambia el código de respuesta.

## Configuración

- `server/package.json`: agregar `nodemailer` a `dependencies`.
- `.env.example`: agregar línea `MAIL_FROM=` con comentario; agregar comentario en
  `SMTP_PORT` indicando 465 → TLS implícito (`secure: true`), 587 → STARTTLS
  (`secure: false`).

## Manejo de errores

- Transporter no configurado → no-op + `console.warn`.
- `sendMail` lanza → capturado en el controller, logueado, respuesta `201` intacta.
- El transporter se memoiza; un fallo de creación (config inválida) se propaga
  como excepción que el `try/catch` del controller atrapa.

## Testing

`server/src/services/mailer.test.js` (`node --test`):

1. **Mensaje bien armado:** inyectar `nodemailer.createTransport({ jsonTransport: true })`
   en `sendContactNotification`; con `NOTIFY_EMAIL` seteado en el test, verificar
   que el resultado contiene `to` = `NOTIFY_EMAIL`, `replyTo` = email del contacto,
   `subject` con el nombre, y que el `text` incluye mensaje, proyecto e instagram.
2. **SMTP no configurado:** con `SMTP_HOST` vacío, `getTransporter()` devuelve `null`
   y `sendContactNotification()` retorna sin lanzar y sin intentar enviar.

(No se agregan tests del controller: no hay suite de controllers existente y
requeriría DB; la lógica de email queda cubierta por el módulo `mailer`.)

## Fuera de alcance (YAGNI)

- Email de confirmación al remitente.
- Plantillas HTML / branding del email.
- Cola/reintentos de envío.
- Configuración de SMTP desde el panel admin.
