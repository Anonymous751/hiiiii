import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true, trim: true },
    profileImage: { type: String, default: "" },

    // Email verification
    isVerified: { type: Boolean, default: false },
    otp: { type: String }, // store 6-digit OTP
    otpExpires: { type: Date }, // OTP expiration
  },
  { timestamps: true }
);

const userModel = mongoose.model("User", userSchema);
export default userModel;
