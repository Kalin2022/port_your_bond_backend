"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendBundleEmail = sendBundleEmail;
// port_your_bond/server/emailSender.ts
const nodemailer = __importStar(require("nodemailer"));
const path = __importStar(require("path"));
// Gmail SMTP configuration
// Note: Use your main Gmail account for auth, but send from the alias
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.MAIL_AUTH_USER || process.env.MAIL_USER, // Main Gmail account for auth
        pass: process.env.MAIL_PASS, // App password for main account
    },
    tls: {
        rejectUnauthorized: false // Allow self-signed certificates
    }
});
async function sendBundleEmail(recipientEmail, zipPath) {
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
    }
    catch (error) {
        console.error('❌ Failed to send email:', error);
        throw new Error('Email delivery failed');
    }
}
