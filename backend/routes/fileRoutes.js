const express = require("express");
const multer = require("multer");
const path = require("path");
const { getFiles, getFileStats, uploadFile, downloadFile, updateFile, deleteFile } = require("../fileController");

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/plain",
      "text/csv",
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "application/zip",
      "application/x-rar-compressed",
      "application/json",
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

// Get all files for a user
router.get("/:userId", getFiles);

// Get file statistics
router.get("/:userId/stats", getFileStats);

// Upload a file
router.post("/upload", upload.single("file"), uploadFile);

// Download a file
router.get("/download/:fileId", downloadFile);

// Update file metadata
router.put("/:fileId", updateFile);

// Delete a file
router.delete("/:fileId", deleteFile);

module.exports = router;
