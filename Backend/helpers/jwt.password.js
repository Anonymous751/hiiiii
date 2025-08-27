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
