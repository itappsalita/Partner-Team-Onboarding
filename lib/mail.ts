import nodemailer from "nodemailer";

/**
 * Configure the email transporter using SMTP settings from environment variables.
 * Note: If credentials are not provided, it will fallback to a dummy logger for development.
 */
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.example.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465",
  auth: {
    user: process.env.SMTP_USER || "user@example.com",
    pass: process.env.SMTP_PASSWORD || "password",
  },
});

const APP_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

/**
 * Sends a password reset email to the user.
 * @param email The recipient's email address.
 * @param token The raw reset token to include in the link.
 */
export async function sendPasswordResetEmail(email: string, token: string) {
  const resetLink = `${APP_URL}/reset-password?token=${token}&email=${email}`;
  
  const mailOptions = {
    from: '"Partner Onboarding" <no-reply@alita.id>',
    to: email,
    subject: "Reset Password - Alita Partner Onboarding",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 2px solid #E67E22;">
          <img src="${APP_URL}/images/logo.png" alt="Alita Logo" style="height: 40px; margin-bottom: 10px;" />
          <h2 style="margin: 0; color: #222;">Reset Your Password</h2>
        </div>
        <div style="padding: 30px;">
          <p>Hello,</p>
          <p>We received a request to reset the password for your Alita Partner Onboarding account. If you didn't make this request, you can safely ignore this email.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #E67E22; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666; font-size: 14px;">${resetLink}</p>
          <p>This link will expire in <strong>1 hour</strong>.</p>
          <p style="margin-top: 30px; font-size: 14px; color: #888;">Best regards,<br/>Team Alita Praya Mitra</p>
        </div>
        <div style="background-color: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #aaa;">
          &copy; ${new Date().getFullYear()} PT. Alita Praya Mitra. All rights reserved.
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent: %s", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Error sending email:", error);
    // In dev, we might want to return success just so the UI proceeds if SMTP isn't set up yet
    if (process.env.NODE_ENV === "development") {
      console.warn("SMTP not configured. Link would have been:", resetLink);
      return { success: true, dummy: true, link: resetLink };
    }
    throw error;
  }
}
