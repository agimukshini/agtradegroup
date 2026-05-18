import multer from 'multer';

const MAX_CSV = 5 * 1024 * 1024;
const MAX_ZIP = 100 * 1024 * 1024;

export const importUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_ZIP },
  fileFilter: (_req, file, cb) => {
    const name = file.fieldname;
    if (name === 'csv') {
      const ok =
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'text/plain' ||
        file.originalname.toLowerCase().endsWith('.csv');
      cb(null, ok);
      return;
    }
    if (name === 'imagesZip') {
      const ok =
        file.mimetype === 'application/zip' ||
        file.mimetype === 'application/x-zip-compressed' ||
        file.originalname.toLowerCase().endsWith('.zip');
      cb(null, ok);
      return;
    }
    cb(new Error('Unexpected upload field'));
  },
});
