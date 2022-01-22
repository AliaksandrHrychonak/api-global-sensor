const multer = require('multer');
const ApiError = require('../exceptions/api-error');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!file) {
      throw ApiError.NotFoundError('not file');
    } else {
      cb(null, 'public/avatars');
    }
  },
  filename: (req, file, cb) => {
    if (!file || !req.user) {
      throw ApiError.NotFoundError('not file');
    } else {
      cb(null, `${Date.now()}_${req.user.id}_${file.originalname}`);
    }
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.toString() === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/gif' || file.mimetype === 'image/svg') {
    cb(null, true);
  } else {
    cb(ApiError.BadRequestError('supported_formats'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter,
});

module.exports = upload;
