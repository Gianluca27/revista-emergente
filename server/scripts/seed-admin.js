#!/usr/bin/env node
/**
 * Crea el usuario administradora en la base de datos.
 * Uso: node scripts/seed-admin.js --email admin@revistaemergente.ar --password <PASSWORD>
 *
 * Requiere DATABASE_URL en server/.env
 */
import bcrypt from 'bcrypt';
import pg from 'pg';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../.env') });

const args = process.argv.slice(2);
const emailIdx = args.indexOf('--email');
const passIdx  = args.indexOf('--password');

if (emailIdx === -1 || passIdx === -1) {
  console.error('Uso: node scripts/seed-admin.js --email <EMAIL> --password <PASSWORD>');
  process.exit(1);
}

const email    = args[emailIdx + 1];
const password = args[passIdx + 1];

if (!email || !password) {
  console.error('Email y password requeridos.');
  process.exit(1);
}

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const hash = await bcrypt.hash(password, 12);

try {
  const result = await pool.query(
    'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id, email',
    [email, hash]
  );
  console.log(`Admin creado: id=${result.rows[0].id}, email=${result.rows[0].email}`);
} catch (err) {
  if (err.code === '23505') {
    console.error('Ya existe un usuario con ese email.');
  } else {
    console.error('Error:', err.message);
  }
} finally {
  await pool.end();
}
