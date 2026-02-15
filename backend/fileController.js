const pool = require("./db");
const fs = require("fs").promises;
const path = require("path");

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, "uploads");
const ensureUploadsDir = async () => {
  try {
    await fs.mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    console.error("Error creating uploads directory:", error);
  }
};

ensureUploadsDir();

// Get all files for a user
const getFiles = async (req, res) => {
  try {
    const { userId } = req.params;
    const { search, category } = req.query;
    const connection = await pool.getConnection();

    let query = "SELECT * FROM files WHERE userId = ?";
    const params = [userId];

    if (category && category !== "All") {
      query += " AND fileCategory = ?";
      params.push(category);
    }

    query += " ORDER BY uploadedDate DESC";

    const [files] = await connection.execute(query, params);

    // Filter by search if provided
    let filteredFiles = files;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredFiles = files.filter(
        (file) =>
          file.fileName.toLowerCase().includes(searchLower) ||
          (file.description && file.description.toLowerCase().includes(searchLower)) ||
          (file.tags && file.tags.toLowerCase().includes(searchLower))
      );
    }

    connection.release();
    res.json({ success: true, files: filteredFiles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get file statistics
const getFileStats = async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await pool.getConnection();

    const [stats] = await connection.execute(
      `SELECT 
        COUNT(*) as totalFiles,
        SUM(fileSize) as totalSize,
        fileCategory,
        COUNT(*) as count
      FROM files 
      WHERE userId = ? 
      GROUP BY fileCategory`,
      [userId]
    );

    connection.release();

    const formatted = {
      totalFiles: stats.reduce((sum, s) => sum + s.count, 0),
      totalSize: stats.reduce((sum, s) => sum + (s.totalSize || 0), 0),
      byCategory: stats.map((s) => ({
        category: s.fileCategory,
        count: s.count,
        size: s.totalSize || 0,
      })),
    };

    res.json({ success: true, stats: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload file
const uploadFile = async (req, res) => {
  try {
    const { userId, fileCategory, description, tags } = req.body;

    if (!userId || !req.file) {
      return res.status(400).json({ success: false, message: "userId and file are required" });
    }

    const connection = await pool.getConnection();

    const fileName = req.file.filename;
    const originalFileName = req.file.originalname;
    const fileType = req.file.mimetype;
    const fileSize = req.file.size;
    const filePath = req.file.path;

    const query = `
      INSERT INTO files (userId, fileName, originalFileName, fileType, fileSize, fileCategory, description, tags, filePath)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const [result] = await connection.execute(query, [
      userId,
      fileName,
      originalFileName,
      fileType,
      fileSize,
      fileCategory || "Document",
      description || null,
      tags || null,
      filePath,
    ]);

    connection.release();

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      fileId: result.insertId,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Download file
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const connection = await pool.getConnection();

    const [files] = await connection.execute("SELECT * FROM files WHERE id = ?", [fileId]);

    connection.release();

    if (files.length === 0) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    const file = files[0];
    res.download(file.filePath, file.originalFileName);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update file metadata
const updateFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { fileCategory, description, tags } = req.body;

    const connection = await pool.getConnection();

    const query = `
      UPDATE files 
      SET fileCategory = ?, description = ?, tags = ?, updatedDate = CURRENT_TIMESTAMP
      WHERE id = ?
    `;

    const [result] = await connection.execute(query, [
      fileCategory || "Document",
      description || null,
      tags || null,
      fileId,
    ]);

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "File not found" });
    }

    res.json({ success: true, message: "File updated successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const connection = await pool.getConnection();

    const [files] = await connection.execute("SELECT * FROM files WHERE id = ?", [fileId]);

    if (files.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: "File not found" });
    }

    // Delete file from filesystem
    try {
      await fs.unlink(files[0].filePath);
    } catch (error) {
      console.error("Error deleting file from filesystem:", error);
    }

    // Delete from database
    await connection.execute("DELETE FROM files WHERE id = ?", [fileId]);

    connection.release();
    res.json({ success: true, message: "File deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getFiles,
  getFileStats,
  uploadFile,
  downloadFile,
  updateFile,
  deleteFile,
};
