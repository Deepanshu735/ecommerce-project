import {
  getUserFiles,
  getFileById,
  deleteFile,
  createFile,
} from "./files.service.js";


export async function listFiles(req, res) {
  const files = await getUserFiles(req.user.id);

  res.json(files);
}

export async function getFile(req, res) {
  const file = await getFileById(
    req.params.id,
    req.user.id
  );

  if (!file) {
    return res.status(404).json({
      message: "File not found",
    });
  }

  res.json(file);
}

export async function removeFile(req, res) {
  const file = await deleteFile(
    req.params.id,
    req.user.id
  );

  if (!file) {
    return res.status(404).json({
      message: "File not found",
    });
  }

  res.json({
    message: "File deleted successfully",
  });
}
import path from "path";

export async function downloadFile(req, res) {
  const file = await getFileById(
    req.params.id,
    req.user.id
  );

  if (!file) {
    return res.status(404).json({
      message: "File not found",
    });
  }

  const absolutePath = path.resolve(
    file.path
  );

  res.download(
    absolutePath,
    file.originalName,
    (error) => {
      if (error) {
        console.error(
          "File download error:",
          error
        );
      }
    }
  );
}

export async function uploadFile(req, res) {
  if (!req.file) {
    return res.status(400).json({
      message: "No file uploaded",
    });
  }

  const file = await createFile({
    userId: req.user.id,
    originalName: req.file.originalname,
    fileName: req.file.filename,
    mimeType: req.file.mimetype,
    size: req.file.size,
    path: req.file.path,
  });

  res.status(201).json({
    message: "File uploaded successfully",
    file,
  });
}
export async function uploadFiles(req, res) {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      message: "No files uploaded",
    });
  }

  const files = await Promise.all(
    req.files.map((file) =>
      createFile({
        userId: req.user.id,
        originalName: file.originalname,
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: file.path,
      })
    )
  );

  res.status(201).json({
    message: "Files uploaded successfully",
    count: files.length,
    files,
  });
}