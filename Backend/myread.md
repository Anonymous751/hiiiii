Perfect 👍 you’ve set up a complete authentication flow already! 🚀
Now the next steps are testing the routes one by one in order, to make sure the flow works properly.

Here’s the flow you should follow now:

🔹 1. User Registration + Email OTP

Endpoint: POST /register

Body: { name, email, password, profileImage (optional) }

Expected:

User is created (but not active yet).

OTP is sent to the given email via Ethereal (check the link in your console/logs).

🔹 2. Verify OTP

Endpoint: POST /verify-otp

Body: { email, otp }

Expected:

If OTP is correct → user account is activated.

If wrong → error response.

(If OTP expired → you can use POST /resend-otp).

🔹 3. Login

Endpoint: POST /login

Body: { email, password }

Expected:

JWT token generated & returned.

Store the token in localStorage (frontend) or cookie (backend with httpOnly).

🔹 4. Access Protected Route

Endpoint: GET /logged-user

Headers: { Authorization: Bearer <token> }

Expected:

Returns logged-in user details.

If token missing/invalid → error.

🔹 5. Password Reset Flow

Forgot password

POST /send-reset-password-email → sends reset link via Ethereal.

Reset link: /password-reset/:id/:token.

Reset password with token

POST /password-reset/:id/:token → reset with token from email.

Direct reset (for testing)

POST /reset-password-direct → reset with email + password (skips email link).

🔹 6. Change Password (after login)

Endpoint: POST /change-password

Headers: { Authorization: Bearer <token> }

Body: { oldPassword, newPassword }

🔹 7. Logout

Endpoint: POST /logout

Clears user session/token on the backend (or frontend if stored locally).
