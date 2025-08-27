i am provided whole code ?
// Import jsonwebtoken library
import jwt from "jsonwebtoken";

/**
 * Generate a JWT token
 * @param {string} userId - The ID of the user (unique identifier)
 * @param {string} expiresIn - Expiration time (default: "1d" = 1 day)
 * @returns {string} - Signed JWT token
 */
export const generateToken = (userId, expiresIn = "1d") => {
  try {
    // jwt.sign(payload, secretKey, options)
    const token = jwt.sign(
      { userId }, // payload: stores userId inside token
      process.env.JWT_SECRET, // secret key from .env file
      { expiresIn } // token expiry duration
    );

    return token;
  } catch (error) {
    console.error("❌ Error generating token:", error.message);
    throw new Error("Token generation failed");
  }
};

/**
 * Verify and decode a JWT token
 * @param {string} token - JWT token to verify
 * @param {string} secret - Secret key (default: from .env file)
 * @returns {object} - Decoded payload if token is valid
 */
export const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  try {
    // jwt.verify(token, secretKey)
    const decoded = jwt.verify(token, secret);
    return decoded; // contains userId and other info
  } catch (error) {
    console.error("❌ Invalid or expired token:", error.message);
    throw new Error("Token verification failed");
  }
};
import bcrypt from "bcrypt";

/**
 * Hash a plain text password before saving to the database.
 *
 * Why? 👉 We never store real passwords (plain text) in the DB because if hackers get access,
 * they could read every password. Instead, we convert (hash) it into a long unreadable string.
 *
 * @param {string} password - The user's plain text password
 * @returns {Promise<string>} - A hashed (encrypted) password string
 */
export const hashPassword = async (password) => {
  // Generate a salt (random string) to make the hash stronger
  const salt = await bcrypt.genSalt(10);

  // Hash the password using the salt
  return bcrypt.hash(password, salt);
};

/**
 * Compare a plain password with a hashed password.
 *
 * Example use case: When a user logs in, we take their entered password,
 * hash it, and then check if it matches the stored hashed password in the DB.
 *
 * @param {string} plainPassword - Password entered by the user (plain text)
 * @param {string} hashedPassword - The password stored in the database (already hashed)
 * @returns {Promise<boolean>} - Returns true if passwords match, false otherwise
 */
export const comparePassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
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
import { getTransporter } from "../config/email/email.config.js";

// Generate random 6-digit OTP
export const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// Send OTP email via Ethereal
export const sendOTPEmail = async (email, otp) => {
  const transporter = await getTransporter();

  const info = await transporter.sendMail({
    from: '"Auth System" <no-reply@example.com>',
    to: email,
    subject: "Email Verification OTP",
    text: `Your OTP code is: ${otp}`,
    html: `<h2>Email Verification</h2>
           <p>Your OTP code is: <b>${otp}</b></p>
           <p>This code will expire in 10 minutes.</p>`,
  });

  console.log("OTP Email sent:", nodemailer.getTestMessageUrl(info));
};
import { verifyToken } from "../helpers/jwt.helper.js";
import userModel from "../myapp/User/models/user.models.js";

/**
 * ================================
 * Authentication Middleware
 * ================================
 * Protects routes by validating JWT token.
 * 
 * 1. Reads token from Authorization header.
 * 2. Verifies token & decodes user ID.
 * 3. Attaches user info (without password) to `req.user`.
 * 4. If invalid/missing → returns 401 Unauthorized.
 * 
 * Usage:
 *   app.get("/protected", protect, (req, res) => { ... });
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // ✅ Check if authorization header contains a Bearer token
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1]; // Extract token
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "❌ No token, authorization denied" });
    }

    // ✅ Verify and decode token
    const decoded = verifyToken(token);

    if (!decoded?.userId) {
      return res.status(401).json({ success: false, message: "❌ Invalid token payload" });
    }

    // ✅ Fetch user (without password) from DB
    const user = await userModel.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({ success: false, message: "❌ User not found" });
    }

    // Attach user to request object
    req.user = user;

    next(); // Continue to next middleware/controller
  } catch (error) {
    console.error("Auth Middleware Error:", error.message);
    return res.status(401).json({ success: false, message: "❌ Not authorized, token failed" });
  }
};

export default protect;
// ==============================
// Import Dependencies & Helpers
// ==============================
import userModel from "../models/user.models.js"; // User model
import {
  hashPassword,
  comparePassword,
} from "../../../helpers/jwt.password.js"; // Password utilities
import { generateToken, verifyToken } from "../../../helpers/jwt.helper.js"; // JWT utilities
import { generateOTP, sendOTPEmail } from "../../../helpers/otp.helper.js";
import crypto from "crypto";
// ==============================
// User Controller
// ==============================
class UserController {
  // ------------------------------
  // REGISTER USER
  // ------------------------------

  // REGISTER USER (send OTP + profileImage upload)
  static userRegistration = async (req, res) => {
    try {
      console.log("📌 Incoming body:", req.body);
      console.log("📌 Incoming file:", req.file);

      const { name, email, password } = req.body;
      const user = await userModel.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User Already Exists" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpires = Date.now() + 60 * 60 * 1000;

      const newUser = await userModel.create({
        name,
        email,
        password,
        profileImage: req.file
          ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
          : null,
        otp,
        otpExpires,
      });

      console.log("✅ User created:", newUser);
      return res
        .status(201)
        .json({ message: "User Registered", user: newUser });
    } catch (error) {
      console.error("❌ Registration Error:", error);
      res.status(500).json({ message: "Server Error", error: error.message });
    }
  };

  // ------------------------------
  // VERIFY EMAIL WITH OTP
  // ------------------------------
  static verifyEmailOTP = async (req, res) => {
    try {
      let { email, otp } = req.body;

      if (!email || !otp) {
        return res
          .status(400)
          .json({ status: "error", message: "Email and OTP are required" });
      }

      email = email.toLowerCase();

      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      if (
        user.otp !== otp ||
        !user.otpExpires ||
        user.otpExpires < Date.now()
      ) {
        return res
          .status(400)
          .json({ status: "error", message: "Invalid or expired OTP" });
      }

      user.isVerified = true;
      user.otp = null;
      user.otpExpires = null;
      await user.save();

      res.status(200).json({
        status: "success",
        message: "Email verified successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        },
      });
    } catch (error) {
      console.error("Verify OTP Error:", error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  };

  // =============================
  // Resend OTP
  // =============================
  static resendOTP = async (req, res) => {
    try {
      let { email } = req.body;
      if (!email) {
        return res
          .status(400)
          .json({ status: "error", message: "Email is required" });
      }

      email = email.toLowerCase();
      const user = await userModel.findOne({ email });

      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      if (user.isVerified) {
        return res
          .status(400)
          .json({ status: "error", message: "User already verified" });
      }

      // Generate new OTP
      const otp = crypto.randomInt(100000, 999999);
      const otpExpires = Date.now() + 2 * 60 * 1000;

      user.otp = otp;
      user.otpExpires = otpExpires;
      await user.save();

      // Normally send via email
      console.log(`Resent OTP for ${email}: ${otp}`);

      res.status(200).json({
        status: "success",
        message: "OTP resent successfully. Please check your email",
      });
    } catch (error) {
      console.error("Resend OTP Error:", error);
      res.status(500).json({ status: "error", message: "Server error" });
    }
  };

  // ==============================
  // LOGIN USER (only if verified)
  // ===============================
  static userLogin = async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password)
        return res.status(400).json({ message: "Email and password required" });

      const user = await userModel.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "User not registered" });

      if (!user.isVerified)
        return res
          .status(403)
          .json({ message: "Please verify your email before login" });

      const isMatch = await comparePassword(password, user.password);
      if (!isMatch)
        return res.status(400).json({ message: "Invalid credentials" });

      const token = generateToken(user._id);

      res
        .cookie("token", token, {
          httpOnly: true,
          secure: false,
          maxAge: 24 * 60 * 60 * 1000,
          sameSite: "Lax",
        })
        .json({
          status: "success",
          message: "Login successful",
          token,
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            profileImage: user.profileImage
              ? `${req.protocol}://${req.get(
                  "host"
                )}/${user.profileImage.replace(/\\/g, "/")}`
              : "",
          },
        });
    } catch (err) {
      console.error("Login error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  };

  // ------------------------------
  // LOGOUT USER
  // ------------------------------
  static userLogout = async (req, res) => {
    try {
      res
        .cookie("token", "", {
          httpOnly: true,
          expires: new Date(0), // Expire immediately
          sameSite: "Lax",
        })
        .json({ status: "success", message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ status: "error", message: "Logout failed" });
    }
  };

  // ------------------------------
  // CHECK IF EMAIL EXISTS
  // ------------------------------
  static checkEmail = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          status: "error",
          message: "Email is required",
        });
      }

      const user = await userModel.findOne({ email });

      if (!user) {
        return res.status(404).json({
          status: "error",
          message: "Email not found",
        });
      }

      return res.status(200).json({
        status: "success",
        message: "Email exists",
        user: { id: user._id, email: user.email },
      });
    } catch (err) {
      console.error("Check email error:", err);
      return res.status(500).json({
        status: "error",
        message: "Server error",
      });
    }
  };

  // ------------------------------
  // CHANGE PASSWORD (LOGGED-IN USER)
  // ------------------------------
  static changePassword = async (req, res) => {
    try {
      const { password, confirm_password } = req.body;

      // Validation
      if (!password || !confirm_password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // Update password
      const newHashedPassword = await hashPassword(password);
      await userModel.findByIdAndUpdate(req.user._id, {
        password: newHashedPassword,
      });

      res.json({ status: "success", message: "Password updated" });
    } catch (error) {
      console.error("Change password error:", error);
      res.status(500).json({ message: "Unable to change password" });
    }
  };

  // ------------------------------
  // GET LOGGED-IN USER INFO
  // ------------------------------
  static Loggeduser = async (req, res) => {
    try {
      const user = req.user; // fetched from auth middleware
      res.json({
        status: "success",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage
            ? `${req.protocol}://${req.get("host")}/${user.profileImage.replace(
                /\\/g,
                "/"
              )}`
            : "",
        },
      });
    } catch (err) {
      console.error("Fetch user error:", err);
      res
        .status(500)
        .json({ status: "error", message: "Failed to fetch user" });
    }
  };

  // ------------------------------
  // SEND RESET PASSWORD EMAIL (MOCKED WITH CONSOLE)
  // ------------------------------
  static sendUserPasswordResetEmail = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) return res.status(400).json({ message: "Email is required" });

      const user = await userModel.findOne({ email });
      if (!user)
        return res.status(404).json({ message: "Email does not exist" });

      // Generate token (1 hour expiry)
      const token = generateToken(user._id, "1h");

      // Simulate sending email (print to console)
      console.log(
        `Password reset link: http://127.0.0.1:3000/users/reset/${user._id}/${token}`
      );

      res.json({
        status: "success",
        message: "Password reset link generated (check console)",
      });
    } catch (error) {
      console.error("Password reset email error:", error);
      res.status(500).json({ message: "Something went wrong" });
    }
  };

  // ------------------------------
  // CHANGE PASSWORD BY EMAIL (with old password check)
  // ------------------------------
  static changePasswordByEmail = async (req, res) => {
    try {
      const { email, oldPassword, newPassword } = req.body;

      // Validation
      if (!email || !oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }

      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Verify old password
      const isMatch = await comparePassword(oldPassword, user.password);
      if (!isMatch) {
        return res
          .status(400)
          .json({ status: "error", message: "Old password is incorrect" });
      }

      // Save new password
      user.password = await hashPassword(newPassword);
      await user.save();

      return res.json({
        status: "success",
        message: "Password updated successfully",
      });
    } catch (err) {
      console.error("Change password by email error:", err);
      return res.status(500).json({ status: "error", message: "Server error" });
    }
  };

  // ------------------------------
  // RESET PASSWORD DIRECTLY (WITHOUT TOKEN)
  // ------------------------------
  static resetPasswordDirectly = async (req, res) => {
    try {
      console.log("Received reset request:", req.body);

      const { email, password, confirm_password } = req.body;

      // Validation
      if (!email || !password || !confirm_password) {
        return res
          .status(400)
          .json({ status: "error", message: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res
          .status(400)
          .json({ status: "error", message: "Passwords do not match" });
      }

      // Find user
      const user = await userModel.findOne({ email });
      if (!user) {
        return res
          .status(404)
          .json({ status: "error", message: "User not found" });
      }

      // Update password
      const hashed = await hashPassword(password);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });

      console.log("Password updated successfully for:", user.email);

      return res.json({
        status: "success",
        message: "Password reset successful",
      });
    } catch (err) {
      console.error("Reset password directly error:", err);
      return res
        .status(500)
        .json({ status: "error", message: "Password reset failed" });
    }
  };

  // ------------------------------
  // RESET PASSWORD USING TOKEN & ID
  // ------------------------------
  static userPasswordReset = async (req, res) => {
    try {
      const { password, confirm_password } = req.body;
      const { id, token } = req.params;

      // 1. Find user
      const user = await userModel.findById(id);
      if (!user) return res.status(404).json({ message: "User not found" });

      // 2. Verify token
      verifyToken(token);

      // 3. Validate
      if (!password || !confirm_password) {
        return res.status(400).json({ message: "All fields are required" });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ message: "Passwords do not match" });
      }

      // 4. Save new password
      const hashed = await hashPassword(password);
      await userModel.findByIdAndUpdate(user._id, { password: hashed });

      res.json({ status: "success", message: "Password reset successful" });
    } catch (error) {
      console.error("Token reset error:", error);
      res.status(400).json({ message: "Invalid or expired token" });
    }
  };
}

// ==============================
// Export Controller
// ==============================
export default UserController;
import express from "express";
import UserController from "../myapp/User/controller/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import upload from "../helpers/multer.conf.js";

const router = express.Router();

// Register + Email OTP
router.post("/register", upload.single("profileImage"), UserController.userRegistration);
router.post("/verify-otp", UserController.verifyEmailOTP);
router.post("/resend-otp", UserController.resendOTP);

// Login, Logout
router.post("/login", UserController.userLogin);
router.post("/logout", UserController.userLogout);

// Password Reset & Change
router.post("/send-reset-password-email", UserController.sendUserPasswordResetEmail);
router.post("/password-reset/:id/:token", UserController.userPasswordReset);
router.post("/reset-password-direct", UserController.resetPasswordDirectly);
router.post("/check-email", UserController.checkEmail);
router.post("/change-password-email", UserController.changePasswordByEmail);
router.post("/change-password", protect, UserController.changePassword);

// Logged user
router.get("/logged-user", protect, UserController.Loggeduser);

export default router;
// ==============================
// Import Dependencies
// ==============================
import createError from "http-errors"; // For handling errors (404, etc.)
import express from "express"; // Express framework
import cookieParser from "cookie-parser"; // To parse cookies
import logger from "morgan"; // HTTP request logger
import { fileURLToPath } from "url"; // To get file paths in ES modules
import { dirname, join } from "path"; // To work with file/directory paths
import dotenv from "dotenv"; // To load environment variables
import usersRouter from "./routes/users.js"; // User routes
import path from "path"; // Node.js path module
import connectDB from "./config/db/db.connect.js"; // MongoDB connection function
import cors from "cors"; // To allow cross-origin requests (frontend ↔ backend)

// ==============================
// Path Setup (for __dirname in ES Modules)
// ==============================
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ==============================
// Initialize App
// ==============================
const app = express();
dotenv.config(); // Load .env file

// ==============================
// Database Connection
// ==============================
const DATABASE_URI = process.env.DATABASE_URI;
connectDB(DATABASE_URI); // Connect to MongoDB

// ==============================
// Middleware
// ==============================

// ✅ CORS (Allow frontend at localhost:5173 to communicate with backend)
// - credentials: true → allows cookies (for JWT auth)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

// ✅ Logger (logs requests in console: GET /users 200 etc.)
app.use(logger("dev"));

// ✅ Parse incoming JSON data (req.body)
app.use(express.json());

// ✅ Parse form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

// ✅ Parse cookies from request headers
app.use(cookieParser());

// ==============================
// Static Files (Public Access)
// ==============================

// Serve uploaded files (images, etc.)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Alternative path (in case of process.cwd())
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use("/uploads", express.static("uploads"));

// ==============================
// Routes
// ==============================
// All user-related routes will start with /users
// Example: /users/register, /users/login, etc.
app.use("/users", usersRouter);

// ==============================
// Error Handling
// ==============================

// 1. Catch 404 errors (route not found)
app.use((req, res, next) => {
  next(createError(404));
});

// 2. Global Error Handler
app.use((err, req, res, next) => {
  // Provide error message
  res.locals.message = err.message;

  // Show full error stack in development only
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // Set status code (default 500 if not provided)
  res.status(err.status || 500);

  // Send JSON error response
  res.json({
    status: "error",
    message: err.message || "Internal Server Error",
  });
});

// ==============================
// Export App
// ==============================
export default app;

i have created the upload folder and save the multer images , but i want to use a package name as multer gridfs storage and save the images in the bucket and for further use, keep the multer gridfs code logic seperate , ?Note: do not skip any thing in the code, I need all till now as it is not ,shortcut please ? modify very carefully and want till now code working