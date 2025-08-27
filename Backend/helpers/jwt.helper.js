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
