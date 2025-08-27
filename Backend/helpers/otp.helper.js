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
