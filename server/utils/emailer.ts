import nodemailer from 'nodemailer';

const hostEmail = process.env.HOST_EMAIL as string;
const hostEmailPass = process.env.HOST_EMAIL_PASS as string;
const notifyEmail = process.env.NOTIFY_EMAIL as string;
const supportEmail = process.env.SUPPORT_EMAIL as string | undefined;
const emailProvider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase(); // 'gmail' | 'smtp'

// SMTP (e.g., Mailgun) envs
const smtpHost = process.env.SMTP_HOST as string | undefined;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpSecure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER as string | undefined;
const smtpPass = process.env.SMTP_PASS as string | undefined;

const transporter = nodemailer.createTransport(
  emailProvider === 'smtp'
    ? {
        host: smtpHost,
        port: smtpPort ?? 587,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        pool: true,
        maxConnections: 3,
      }
    : {
        service: 'gmail',
        auth: {
          user: hostEmail,
          pass: hostEmailPass,
        },
        pool: true,
        maxConnections: 3,
      }
);

if (process.env.NODE_ENV !== 'production') {
  transporter.verify((err) => {
    if (err) {
      console.error('❌ Transport verify failed:', err.message);
    } else {
      console.log('📡 Email transporter verified.');
    }
  });
}

export async function sendCompletionEmail(params: {
  jobId: string;
  link: string;
  timestamp: string;
  to?: string;
}) {
  await transporter.sendMail({
    from: `"Synthisoul System" <${hostEmail}>`,
    to: params.to ?? notifyEmail,
    replyTo: supportEmail ?? hostEmail,
    subject: `🧠 Synthisoul Job Complete — ${params.jobId}`,
    text: `Job ${params.jobId} completed at ${params.timestamp}.\n\nDownload:\n${params.link}`,
    html: `
      <p>Hello!</p>
      <p>Your file has been successfully processed. 🎉</p>
      <p><strong>🧠 Job ID:</strong> ${params.jobId}</p>
      <p><strong>📎 Download:</strong> <a href="${params.link}">${params.link}</a></p>
      <p><strong>🕒 Completed:</strong> ${params.timestamp}</p>
      <p>Thank you for using Synthisoul.</p>
    `,
  });

  console.log('📨 Email sent');
}


