const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
    "image/webp",
    "application/pdf",
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Additional PDF validation
    if (file.mimetype === "application/pdf" && file.size > 20 * 1024 * 1024) {
      cb(new Error("PDF files must be under 20MB"), false);
      return;
    }
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP and PDF files are allowed."), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
  fileFilter,
});

module.exports = { upload };
