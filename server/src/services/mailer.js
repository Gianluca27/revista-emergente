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

  const to = process.env.NOTIFY_EMAIL;
  if (!to) {
    console.warn('[mailer] NOTIFY_EMAIL no configurado — se omite la notificación de contacto');
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
    to,
    from: process.env.MAIL_FROM || process.env.SMTP_USER,
    replyTo: email,
    subject: `[Emergente] Nueva solicitud de contacto — ${name}`,
    text,
  });
}
