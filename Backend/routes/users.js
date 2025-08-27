import express from "express";
import UserController from "../myapp/User/controller/user.controller.js";
import protect from "../middleware/auth.middleware.js";
import { upload } from "../helpers/multerGridfs.conf.js";

const router = express.Router();

// Register + OTP
router.post("/register", upload.single("profileImage"), UserController.userRegistration);
router.post("/verify-otp", UserController.verifyEmailOTP);
router.post("/resend-otp", UserController.resendOTP);

// Auth
router.post("/login", UserController.userLogin);
router.post("/logout", UserController.userLogout);

// Password reset & change
router.post("/send-reset-password-email", UserController.sendUserPasswordResetEmail);
router.post("/password-reset/:id/:token", UserController.userPasswordReset);
router.post("/reset-password-direct", UserController.resetPasswordDirectly);
router.post("/check-email", UserController.checkEmail);
router.post("/change-password-email", UserController.changePasswordByEmail);



// Logged-in user
router.get("/logged-user", protect, UserController.Loggeduser);
router.post("/change-password", protect, UserController.changePassword);
router.post("/verify-change-password-otp", protect, UserController.verifyChangePasswordOTP);

export default router;
