import multer from "multer";
import fs from "fs";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id;

    const userFolder = path.join(
      "uploads",
      userId
    );

    fs.mkdirSync(userFolder, {
      recursive: true,
    });

    cb(null, userFolder);
  },

  filename: (req, file, cb) => {
    const extension =
      path.extname(file.originalname);

    const uniqueName =
      `${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!ALLOWED_TYPES.includes(file.mimetype)) {
    return cb(
      new Error(
        "Only JPG, PNG, WEBP and PDF files are allowed"
      )
    );
  }

  cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter,

  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});