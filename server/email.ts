import sgMail from '@sendgrid/mail';
import crypto from 'crypto';

if (!process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
  throw new Error("SMTP credentials must be set");
}

sgMail.setApiKey(process.env.SMTP_PASSWORD);

export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function sendVerificationEmail(
  toEmail: string,
  token: string
): Promise<void> {
  const verificationLink = `${process.env.REPL_SLUG}.repl.co/verify-email?token=${token}`;

  const msg = {
    to: toEmail,
    from: process.env.SMTP_EMAIL as string,
    subject: 'Verify your email for DevQ&A',
    html: `
      <div>
        <h1>Welcome to DevQ&A!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationLink}">${verificationLink}</a>
        <p>This link will expire in 24 hours.</p>
        <p>If you didn't create an account, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send verification email');
  }
}

export async function sendPasswordResetEmail(
  toEmail: string,
  token: string
): Promise<void> {
  const resetLink = `${process.env.REPL_SLUG}.repl.co/reset-password?token=${token}`;

  const msg = {
    to: toEmail,
    from: process.env.SMTP_EMAIL as string,
    subject: 'Reset your DevQ&A password',
    html: `
      <div>
        <h1>Password Reset Request</h1>
        <p>Click the link below to reset your password:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request a password reset, you can safely ignore this email.</p>
      </div>
    `,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send password reset email');
  }
}