import nodemailer from 'nodemailer';
import * as crypto from 'crypto';

// Email configuration (reusing your existing setup)
const hostEmail = process.env.HOST_EMAIL as string;
const hostEmailPass = process.env.HOST_EMAIL_PASS as string;
const emailProvider = (process.env.EMAIL_PROVIDER || 'gmail').toLowerCase();

// SMTP configuration
const smtpHost = process.env.SMTP_HOST as string | undefined;
const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined;
const smtpSecure = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
const smtpUser = process.env.SMTP_USER as string | undefined;
const smtpPass = process.env.SMTP_PASS as string | undefined;

// Create transporter
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

// In-memory storage for verification tokens (in production, use a database)
const verificationTokens = new Map<string, { email: string; timestamp: number; verified: boolean }>();

// Generate a secure verification token
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Send verification email
export async function sendVerificationEmail(email: string): Promise<{ success: boolean; token?: string }> {
  try {
    // Generate verification token
    const token = generateVerificationToken();
    const timestamp = Date.now();
    
    // Store token with expiration (24 hours)
    verificationTokens.set(token, {
      email,
      timestamp,
      verified: false
    });
    
    // Create verification URL (you'll need to update this with your actual domain)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verificationUrl = `${baseUrl}/verify-email?token=${token}`;
    
    // Send email
    await transporter.sendMail({
      from: `"SynthiSoul Verification" <${hostEmail}>`,
      to: email,
      subject: '🔐 Verify Your Email - SynthiSoul',
      text: `Please verify your email by clicking this link: ${verificationUrl}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">🔐 Verify Your Email Address</h2>
          <p>Hello!</p>
          <p>Thank you for signing up with SynthiSoul. Please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationUrl}" 
               style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
          <p><small>This link will expire in 24 hours.</small></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #666; font-size: 12px;">
            If you didn't sign up for SynthiSoul, you can safely ignore this email.
          </p>
        </div>
      `,
    });
    
    console.log(`📧 Verification email sent to: ${email}`);
    return { success: true, token };
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false };
  }
}

// Verify email with token
export async function verifyEmailToken(token: string): Promise<{ success: boolean; email?: string }> {
  try {
    const verificationData = verificationTokens.get(token);
    
    if (!verificationData) {
      return { success: false };
    }
    
    // Check if token is expired (24 hours)
    const now = Date.now();
    const tokenAge = now - verificationData.timestamp;
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    if (tokenAge > twentyFourHours) {
      // Remove expired token
      verificationTokens.delete(token);
      return { success: false };
    }
    
    // Mark as verified
    verificationData.verified = true;
    verificationTokens.set(token, verificationData);
    
    console.log(`✅ Email verified: ${verificationData.email}`);
    return { success: true, email: verificationData.email };
    
  } catch (error) {
    console.error('Error verifying email token:', error);
    return { success: false };
  }
}

// Check verification status
export async function checkVerificationStatus(email: string): Promise<{ verified: boolean; timestamp?: number }> {
  try {
    // Find verification data for this email
    for (const [token, data] of verificationTokens.entries()) {
      if (data.email === email) {
        // Check if token is expired
        const now = Date.now();
        const tokenAge = now - data.timestamp;
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (tokenAge > twentyFourHours) {
          // Remove expired token
          verificationTokens.delete(token);
          return { verified: false };
        }
        
        return { 
          verified: data.verified, 
          timestamp: data.timestamp 
        };
      }
    }
    
    return { verified: false };
    
  } catch (error) {
    console.error('Error checking verification status:', error);
    return { verified: false };
  }
}

// Clean up expired tokens (call this periodically)
export function cleanupExpiredTokens(): void {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  
  for (const [token, data] of verificationTokens.entries()) {
    if (now - data.timestamp > twentyFourHours) {
      verificationTokens.delete(token);
    }
  }
}

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
