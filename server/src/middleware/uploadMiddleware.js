import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: path.join(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const safeOriginal = path.basename(file.originalname);
    cb(null, `${uuidv4()}-${safeOriginal}`);
  },
});

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
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter,
});
