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
  delete process.env.MAIL_FROM;
  process.env.SMTP_USER = 'fallback@test.local';
  process.env.NOTIFY_EMAIL = 'destino@test.local';
  const { sendContactNotification } = await import('./mailer.js');

  let captured;
  const fakeTransporter = { sendMail: async (msg) => { captured = msg; return {}; } };

  await sendContactNotification({ name: 'Beto', email: 'beto@example.com', message: 'm' }, fakeTransporter);
  assert.match(captured.text, /Proyecto:\s+—/);
  assert.match(captured.text, /Instagram:\s+—/);
  assert.equal(captured.from, 'fallback@test.local'); // MAIL_FROM ausente → cae a SMTP_USER
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

test('sendContactNotification no envía si falta NOTIFY_EMAIL', async () => {
  const originalNotify = process.env.NOTIFY_EMAIL;
  delete process.env.NOTIFY_EMAIL;
  const { sendContactNotification } = await import('./mailer.js');
  const throwingTransporter = { sendMail: () => { throw new Error('no debería enviarse'); } };
  await sendContactNotification({ name: 'X', email: 'x@e.com', message: 'm' }, throwingTransporter);
  // pasa si no lanza
  if (originalNotify !== undefined) process.env.NOTIFY_EMAIL = originalNotify;
});
