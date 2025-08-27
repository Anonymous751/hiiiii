import nodemailer from "nodemailer";

// Step 1: Create a temporary Ethereal test account
export const createTestAccount = async () => {
  const account = await nodemailer.createTestAccount();
  console.log("✅ Ethereal test account created:");
  console.log(`User: ${account.user}`);
  console.log(`Pass: ${account.pass}`);
  console.log(`Login at: https://ethereal.email/login`);
  return account;
};

// Step 2: Configure and return the transporter using the test account
export const getTransporter = async () => {
  const account = await createTestAccount();

  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // use TLS, not SSL
    auth: {
      user: account.user,
      pass: account.pass,
    },
  });
};
