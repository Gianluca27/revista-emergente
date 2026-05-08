import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { runMigrations } from './services/migrate.js';
import pool from './services/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRoutes from './routes/auth.routes.js';
import publicationsRoutes from './routes/publications.routes.js';
import artistsRoutes from './routes/artists.routes.js';
import podcastRoutes from './routes/podcast.routes.js';
import showsRoutes from './routes/shows.routes.js';
import contactRoutes from './routes/contact.routes.js';
import uploadRoutes from './routes/upload.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(cookieParser());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api', publicationsRoutes);
app.use('/api', artistsRoutes);
app.use('/api', podcastRoutes);
app.use('/api', showsRoutes);
app.use('/api', contactRoutes);
app.use('/api', uploadRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

runMigrations(pool)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('[migrate] fatal:', err);
    process.exit(1);
  });

export default app;
