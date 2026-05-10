import { upload, processAndSave } from '../middleware/uploadMiddleware.js';

export function uploadImage(req, res) {
  upload.single('image')(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ error: 'Archivo demasiado grande. Máximo 8MB.' });
      }
      if (err.code === 'INVALID_MIME') {
        return res.status(400).json({ error: 'Tipo de archivo no permitido. Solo jpg, png, webp.' });
      }
      return res.status(500).json({ error: 'Error al subir archivo.' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No se recibió ningún archivo.' });
    }

    try {
      const { url } = await processAndSave(req.file.buffer);
      res.status(201).json({ url });
    } catch (e) {
      console.error('[upload] sharp error:', e);
      res.status(500).json({ error: 'Error al procesar imagen.' });
    }
  });
}
