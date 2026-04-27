import { upload } from '../middleware/uploadMiddleware.js';

export function uploadImage(req, res) {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Archivo demasiado grande. Máximo 5MB.' });
      }
      if (err.code === 'INVALID_MIME') {
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo jpg, png, webp.' });
      }
      return res.status(500).json({ error: 'Error al subir archivo.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }
    const url = `/uploads/${req.file.filename}`;
    res.status(201).json({ url });
  });
}
