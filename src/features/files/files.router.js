import express from "express";

import { upload } from "./files.upload.js";

import {
  listFiles,
  getFile,
  removeFile,
  uploadFile,
  uploadFiles,
  downloadFile,
} from "./files.controller.js";

import { authenticate } from "../../common/auth.js";

const router = express.Router();

// Single file
router.post(
  "/upload",
  authenticate,
  upload.single("file"),
  uploadFile
);

// Multiple files
router.post(
  "/upload-multiple",
  authenticate,
  upload.array("files", 5),
  uploadFiles
);


// Read all files
router.get(
  "/",
  authenticate,
  listFiles
);
router.get(
  "/:id/download",
  authenticate,
  downloadFile
);
// Read one file
router.get(
  "/:id",
  authenticate,
  getFile
);

// Delete file
router.delete(
  "/:id",
  authenticate,
  removeFile
);

export default router;