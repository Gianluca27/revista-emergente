import pg from 'pg';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '../..', '.env') });

const { Pool } = pg;

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
