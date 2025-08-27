import multer from "multer";
import path from "path";

/**
 * ================================
 * Multer Configuration for File Uploads
 * ================================
 *
 * 1. Storage: Where & how files are saved.
 * 2. File Filter: Allow only specific file types.
 * 3. Upload: Middleware to handle single/multiple uploads.
 */

// ---------------- Storage Config ----------------
const storage = multer.diskStorage({
  /**
   * Destination folder where uploaded files will be stored
   * @param {Object} req - Express request object
   * @param {Object} file - File being uploaded
   * @param {Function} cb - Callback to tell multer where to save
   */
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Save inside "uploads/" folder
  },

  /**
   * Rename the file before saving
   * @param {Object} req - Express request object
   * @param {Object} file - File being uploaded
   * @param {Function} cb - Callback to tell multer the new filename
   */
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname); // Extract file extension
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName); // Example: 1692895729876-123456789.png
  },
});

// ---------------- File Filter (Allow only images) ----------------
/**
 * Allow only certain file types for upload
 * @param {Object} req - Express request object
 * @param {Object} file - File being uploaded
 * @param {Function} cb - Callback to approve/reject the file
 */
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/; // Allowed extensions
  const ext = path.extname(file.originalname).toLowerCase(); // File extension

  if (allowedTypes.test(ext)) {
    cb(null, true); // Accept file
  } else {
    cb(
      new Error("❌ Only image files (jpeg, jpg, png, webp) are allowed"),
      false
    );
  }
};

// ---------------- Multer Middleware ----------------
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit: 5MB
});

export default upload;
