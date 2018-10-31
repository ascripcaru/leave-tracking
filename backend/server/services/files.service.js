import multer from 'multer';

const storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, 'uploads/')
  },
  filename: function (req, file, callback) {
    const originalName = file.originalname;
    const dotIndex = originalName.lastIndexOf('.');
    const now = Date.now();
    const name = originalName.substring(0, dotIndex) || originalName;
    const extension = dotIndex !== -1 ? originalName.substring(dotIndex, originalName.length) : '';

    const fileName = `${name}-${now}${extension}`;

    callback(null, fileName);
  }
});

const upload = multer({ storage, limits: { fieldSize: 5000000 } });

export default upload;
