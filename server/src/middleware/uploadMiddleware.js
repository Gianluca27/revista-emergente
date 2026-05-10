import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { promises as fs } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 8 * 1024 * 1024;
const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('INVALID_MIME');
    err.code = 'INVALID_MIME';
    cb(err, false);
  }
};

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});

export async function processAndSave(buffer) {
  await fs.mkdir(UPLOADS_DIR, { recursive: true });
  const filename = `${uuidv4()}.webp`;
  const outPath = path.join(UPLOADS_DIR, filename);

  await sharp(buffer, { failOn: 'none' })
    .rotate()
    .resize({ width: MAX_WIDTH, withoutEnlargement: true, fit: 'inside' })
    .webp({ quality: WEBP_QUALITY, effort: 4 })
    .toFile(outPath);

  return { filename, url: `/uploads/${filename}` };
}
