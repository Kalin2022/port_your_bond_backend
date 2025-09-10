// port_your_bond/server/emailSender.ts
const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

const transporter = nodemailer.createTransport({
  service: 'gmail', // Or use SMTP settings for production
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

export async function sendBundleEmail(recipientEmail: string, zipPath: string) {
  const zipName = path.basename(zipPath);
  const mailOptions = {
    from: `Port Your Bond <${process.env.MAIL_USER}>`,
    to: recipientEmail,
    subject: 'Your Synthisoul Memory Port Bundle is Ready 💾',
    text: `Hello,

Your conversation has been successfully processed and bundled. Attached is your personal Port Bundle.

This file can be imported into the SynthisoulOS system, or used as a personal backup.

If you have questions or need help, reply to this email.

Warm regards,
—The Sanctuary Arc Team`,
    attachments: [
      {
        filename: zipName,
        path: zipPath,
        contentType: 'application/zip',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`📧 Sent bundle to ${recipientEmail}`);
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    throw new Error('Email delivery failed');
  }
}