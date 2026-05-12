import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.join(fileURLToPath(new URL('../..', import.meta.url)), '.env') });

const PREFIX = '__test_team_';
let pool;
let Team;

before(async () => {
  Team = await import('./teamMembers.js');
  pool = (await import('../services/db.js')).default;
  // La tabla puede no existir si las migraciones no corrieron en este contexto.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS team_members (
      id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, role VARCHAR(255),
      bio TEXT, photo VARCHAR(500), position INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW()
    )`);
  await pool.query('DELETE FROM team_members WHERE name LIKE $1', [PREFIX + '%']);
});

after(async () => {
  if (pool) {
    await pool.query('DELETE FROM team_members WHERE name LIKE $1', [PREFIX + '%']);
    await pool.end();
  }
});

// Estos tests comparten estado y corren en orden (mismo patrón que migrate.test.js).
test('create() devuelve el row y asigna position incremental', async () => {
  const a = await Team.create({ name: PREFIX + 'A' });
  const b = await Team.create({ name: PREFIX + 'B', role: 'Rol B', bio: 'Bio B' });
  assert.equal(typeof a.id, 'number');
  assert.equal(b.name, PREFIX + 'B');
  assert.ok(b.position > a.position, 'el segundo miembro recibe un position mayor');
});

test('getAll() devuelve los miembros ordenados por position', async () => {
  const ours = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX));
  assert.deepEqual(ours.map(m => m.name), [PREFIX + 'A', PREFIX + 'B']);
});

test('reorder() reasigna position según el orden de ids recibido', async () => {
  const ours = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX));
  const [a, b] = ours; // A position menor, B position mayor
  await Team.reorder([b.id, a.id]);
  const reordered = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX));
  assert.deepEqual(reordered.map(m => m.name), [PREFIX + 'B', PREFIX + 'A']);
});

test('update() cambia solo los campos provistos', async () => {
  const target = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX))[0];
  const updated = await Team.update(target.id, { role: 'Tester' });
  assert.equal(updated.role, 'Tester');
  assert.equal(updated.name, target.name); // name intacto
});

test('remove() elimina el miembro', async () => {
  const target = (await Team.getAll()).filter(m => m.name.startsWith(PREFIX))[0];
  await Team.remove(target.id);
  const still = (await Team.getAll()).filter(m => m.id === target.id);
  assert.equal(still.length, 0);
});
