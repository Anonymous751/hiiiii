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
// ==============================
// REGISTER USER (send OTP + profileImage upload)
// ==============================
static userRegistration = async (req, res) => {
  try {
    const { name, email, password, confirm_password } = req.body;

    if (!name || !email || !password || !confirm_password) {
      return res.status(400).json({ status: "error", message: "All fields are required" });
    }

    if (password !== confirm_password) {
      return res.status(400).json({ status: "error", message: "Passwords do not match" });
    }

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ status: "error", message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate OTP (6 digits)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 60 * 60 * 1000; // OTP valid for 1 hour

    // Handle profile image
    let profileImageRef = null;
    if (req.file) {
      profileImageRef = req.file.filename; // ONLY filename
    }

    // Create user
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      profileImage: profileImageRef,
      otp,
      otpExpires,
      isVerified: false, // user must verify email
    });

    // Optionally: send OTP via email
    // await sendOTPEmail(email, otp);

    res.status(201).json({
      status: "success",
      message: "User registered successfully. Please verify your email with the OTP.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        profileImage: profileImageRef,
        otp, // include only for testing; remove in production
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ status: "error", message: "Server error" });
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
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "Email and password required" });

  const user = await userModel.findOne({ email });
  if (!user) return res.status(404).json({ message: "User not registered" });

  // ❌ Check if verified
  if (!user.isVerified) {
    return res.status(401).json({
      status: "error",
      message: "Email not verified. Please verify your email first."
    });
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const token = generateToken(user._id);

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: "Lax",
  });

  res.json({
    status: "success",
    message: "Login successful",
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      profileImage: user.profileImage,
    },
  });
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
  // POST /users/check-email
static checkEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email)
      return res.status(400).json({ status: "error", message: "Email is required" });

    const user = await userModel.findOne({ email });
    if (!user)
      return res.status(404).json({ status: "error", message: "Email not found" });

    // ✅ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 min validity

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    // ✅ Log OTP in console
    console.log(`OTP for ${email}: ${otp} (valid 10 mins)`);

    res.status(200).json({
      status: "success",
      message: "Email exists. OTP generated and logged in console.",
    });
  } catch (err) {
    console.error("Check email error:", err);
    res.status(500).json({ status: "error", message: "Server error" });
  }
};


  // ------------------------------
  // CHANGE PASSWORD (LOGGED-IN USER)
  // ------------------------------
static changePassword = async (req, res) => {
  try {
    const { password, confirm_password } = req.body;
    const user = req.user;

    if (!password || !confirm_password)
      return res.status(400).json({ message: "All fields are required" });

    if (password !== confirm_password)
      return res.status(400).json({ message: "Passwords do not match" });

    // 1️⃣ Generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    // 2️⃣ Save OTP and hashed password temporarily
    user.otp = otp;
    user.otpExpires = otpExpires;
    user.newPasswordTemp = await hashPassword(password);
    await user.save();

    // 3️⃣ Log OTP
    console.log(`🔑 OTP for password change for ${user.email}: ${otp} (valid 10 mins)`);

    res.json({
      status: "success",
      message: "OTP generated. Please verify OTP to complete password change.",
    });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ message: "Unable to change password" });
  }
};  


// verify to check the OTP 
static verifyChangePasswordOTP = async (req, res) => {
  try {
    const { otp } = req.body;
    const user = req.user;

    if (!otp) return res.status(400).json({ message: "OTP is required" });

    if (!user.otp || user.otp !== otp || user.otpExpires < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    // ✅ OTP is valid → save new password
    user.password = user.newPasswordTemp;
    user.newPasswordTemp = null;
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ status: "success", message: "Password changed successfully" });
  } catch (err) {
    console.error("Verify OTP error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




  // ------------------------------
  // GET LOGGED-IN USER INFO
  // ------------------------------
  static Loggeduser = async (req, res) => {
  try {
      const user = req.user; // from auth middleware
      if (!user) return res.status(401).json({ message: "Unauthorized" });

      res.json({
        status: "success",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          profileImage: user.profileImage, // ONLY filename
        },

      });
      console.log("✅ User stored in DB:", {
  name: newUser.name,
  email: newUser.email,
  profileImage: newUser.profileImage,
});
    } catch (error) {
      console.error("Fetch user error:", error);
      res.status(500).json({ message: "Server error" });
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
