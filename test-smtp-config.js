// SMTP Configuration Diagnostic Tool
require('dotenv').config();
const nodemailer = require('nodemailer');

async function testSMTPConfigs() {
    const email = process.env.MAIL_USER;
    const password = process.env.MAIL_PASS;
    
    console.log(`🔍 Testing SMTP configurations for: ${email}`);
    console.log('='.repeat(50));
    
    // Test different SMTP configurations
    const configs = [
        {
            name: 'Gmail SMTP',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: { user: email, pass: password }
            }
        },
        {
            name: 'Gmail SMTP (SSL)',
            config: {
                host: 'smtp.gmail.com',
                port: 465,
                secure: true,
                auth: { user: email, pass: password }
            }
        },
        {
            name: 'Google Workspace SMTP',
            config: {
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                auth: { user: email, pass: password },
                tls: { rejectUnauthorized: false }
            }
        },
        {
            name: 'Outlook/Hotmail SMTP',
            config: {
                host: 'smtp-mail.outlook.com',
                port: 587,
                secure: false,
                auth: { user: email, pass: password }
            }
        }
    ];
    
    for (const { name, config } of configs) {
        console.log(`\n🧪 Testing ${name}...`);
        try {
            const transporter = nodemailer.createTransport(config);
            await transporter.verify();
            console.log(`✅ ${name} - SUCCESS! This configuration works.`);
            console.log(`   Host: ${config.host}:${config.port}`);
            console.log(`   Secure: ${config.secure}`);
            break; // Stop at first successful config
        } catch (error) {
            console.log(`❌ ${name} - FAILED: ${error.message}`);
        }
    }
}

testSMTPConfigs().catch(console.error);
