// Test script for nodemailer emailSender functionality
require('dotenv').config();
const { sendBundleEmail } = require('./server/server/emailSender.ts');

async function testEmail() {
  try {
    console.log('🧪 Starting email test...');
    console.log('📧 Testing with email: you@example.com');
    console.log('📁 Testing with file: your_data/PORT_BOND_BUNDLE.zip');
    
    // Check if the test file exists
    const fs = require('fs');
    const path = require('path');
    const testFilePath = path.join(__dirname, 'your_data/PORT_BOND_BUNDLE.zip');
    
    if (!fs.existsSync(testFilePath)) {
      console.error('❌ Test file not found:', testFilePath);
      console.log('Please ensure the PORT_BOND_BUNDLE.zip file exists in your_data/');
      return;
    }
    
    // Check environment variables
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      console.error('❌ Missing email credentials in environment variables');
      console.log('Please set MAIL_USER and MAIL_PASS in your .env file');
      return;
    }
    
    console.log('✅ Test file found');
    console.log('✅ Email credentials configured');
    
    // Run the test
    await sendBundleEmail("you@example.com", testFilePath);
    console.log('✅ Email test completed successfully!');
    
  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    console.error('Full error:', error);
  }
}

// Run the test
testEmail();
