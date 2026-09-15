const nodemailer = require('nodemailer');

async function sendPasswordResetEmail({ email, token }) {
  const resetUrl = `${process.env.APP_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  const mailFrom = process.env.MAIL_FROM || 'WealthWise <no-reply@wealthwise.app>';
  const provider = (process.env.EMAIL_PROVIDER || '').toLowerCase();
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your WealthWise Password</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f8fafc; margin: 0; padding: 40px 20px; }
          .container { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #059669; padding: 24px; text-align: center; color: #ffffff; }
          .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
          .content { padding: 32px 24px; color: #334155; line-height: 1.6; }
          .button-container { text-align: center; margin: 32px 0; }
          .button { background-color: #059669; color: #ffffff !important; font-weight: 600; text-decoration: none; padding: 12px 28px; border-radius: 8px; display: inline-block; font-size: 15px; }
          .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
          .link-box { word-break: break-all; background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 6px; font-size: 13px; color: #475569; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>WealthWise</h1>
          </div>
          <div class="content">
            <h2>Password Reset Request</h2>
            <p>Hello,</p>
            <p>We received a request to reset the password for your WealthWise account (<strong>${email}</strong>).</p>
            <p>Click the button below to set a new password. This link is single-use and will expire in 60 minutes:</p>
            <div class="button-container">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link-box">${resetUrl}</div>
            <p style="margin-top: 24px; font-size: 13px; color: #64748b;">If you did not request a password reset, you can safely ignore this email.</p>
          </div>
          <div class="footer">
            &copy; ${new Date().getFullYear()} WealthWise — AI-Powered Personal Wealth Planner. All rights reserved.
          </div>
        </div>
      </body>
    </html>
  `;

  const textContent = `Reset your WealthWise password:\n\nClick the link below to set a new password:\n${resetUrl}\n\nThis link will expire in 60 minutes.\nIf you did not request this, please ignore this email.`;

  // 1. Resend HTTP API provider
  if (provider === 'resend' && resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey}`,
        },
        body: JSON.stringify({
          from: mailFrom,
          to: [email],
          subject: 'Reset your WealthWise password',
          html: htmlContent,
          text: textContent,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Resend API error (${res.status}): ${errText}`);
      }
      console.log(`[EMAIL] Password reset email sent via Resend to ${email}`);
      return { sent: true, provider: 'resend' };
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send email via Resend:', err.message);
    }
  }

  // 2. SMTP provider
  if ((provider === 'smtp' || smtpHost) && smtpHost) {
    try {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: process.env.SMTP_USER ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        } : undefined,
      });

      await transporter.sendMail({
        from: mailFrom,
        to: email,
        subject: 'Reset your WealthWise password',
        html: htmlContent,
        text: textContent,
      });
      console.log(`[EMAIL] Password reset email sent via SMTP to ${email}`);
      return { sent: true, provider: 'smtp' };
    } catch (err) {
      console.error('[EMAIL ERROR] Failed to send email via SMTP:', err.message);
    }
  }

  // 3. Fallback for Development (Console log & Dev Shortcut)
  console.log(`\n======================================================`);
  console.log(`[DEV EMAIL SIMULATION] Reset link for ${email}:`);
  console.log(`${resetUrl}`);
  console.log(`======================================================\n`);

  return { sent: false, provider: 'console', resetUrl };
}

module.exports = { sendPasswordResetEmail };
