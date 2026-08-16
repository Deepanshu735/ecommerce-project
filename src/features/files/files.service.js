import File from "./files.model.js";

export async function createFile(data) {
  return File.create(data);
}

export async function getUserFiles(userId) {
  return File.find({ userId })
    .sort({ createdAt: -1 });
}

export async function getFileById(id, userId) {
  return File.findOne({
    _id: id,
    userId,
  });
}

export async function deleteFile(id, userId) {
  return File.findOneAndDelete({
    _id: id,
    userId,
  });
}