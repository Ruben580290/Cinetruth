const multer = require("multer");

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB, segun el alcance del proyecto

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error("Solo se permiten imagenes JPEG o PNG."));
  }
  cb(null, true);
};

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter,
});

module.exports = upload;
