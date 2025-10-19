// index.ts - Main server entry point
import express from 'express';
import processRoute from './processRoute';
import { stripeWebhook } from './stripeWebhook';
import runpodWebhook from './runpodWebhook';
import { sendVerificationEmail, checkVerificationStatus, verifyEmailToken } from './utils/emailVerification';
import * as dotenv from 'dotenv';
import * as path from 'path';


// Load environment variables
dotenv.config();

const app = express();

// Use PORT environment variable if set, otherwise default to 10000
const PORT = process.env.PORT ? Number(process.env.PORT) : 10000;
console.log('🚀 Using PORT:', PORT, '(from environment or default)');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration for sanctuaryarc.com integration and local development
app.use((req: any, res: any, next: any) => {
  const allowedOrigins = [
    'https://www.sanctuaryarc.com',
    'https://sanctuaryarc.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173'
  ];
  
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Serve static files
app.use('/ui', express.static(path.join(__dirname, '../ui_preview')));
app.use('/output', express.static(path.join(__dirname, '../outputs')));
app.use('/temp', express.static(path.join(__dirname, '../public/temp')));

// Routes
console.log('📡 Setting up routes...');
app.use('/', processRoute);
console.log('✅ Process route loaded');
app.post('/stripe-webhook', stripeWebhook);
console.log('✅ Stripe webhook loaded');
app.use('/', runpodWebhook);
console.log('✅ RunPod webhook loaded');

// Email verification endpoints
app.post('/send-verification', async (req: any, res: any) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email is required' 
      });
    }
    
    const result = await sendVerificationEmail(email);
    
    res.status(200).json({ 
      message: result.autoVerified ? 'Email auto-verified for testing' : 'Verification email sent',
      email: email,
      success: result.success,
      autoVerified: result.autoVerified || false
    });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ 
      message: 'Failed to send verification email',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.get('/verify-status', async (req: any, res: any) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ 
        message: 'Email parameter is required' 
      });
    }
    
    const verificationStatus = await checkVerificationStatus(email as string);
    
    res.status(200).json({ 
      verified: verificationStatus.verified,
      email: email,
      timestamp: verificationStatus.timestamp
    });
  } catch (error) {
    console.error('Error checking verification status:', error);
    res.status(500).json({ 
      message: 'Failed to check verification status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Email verification endpoint (for handling verification link clicks)
app.get('/verify-email', async (req: any, res: any) => {
  try {
    const { token } = req.query;
    
    if (!token) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #d32f2f;">❌ Invalid Verification Link</h2>
            <p>The verification link is missing or invalid.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
      `);
    }
    
    const result = await verifyEmailToken(token as string);
    
    if (result.success) {
      res.send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #2e7d32;">✅ Email Verified Successfully!</h2>
            <p>Your email <strong>${result.email}</strong> has been verified.</p>
            <p>You can now use all features of SynthiSoul.</p>
            <p><a href="/" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Return to Home</a></p>
          </body>
        </html>
      `);
    } else {
      res.status(400).send(`
        <html>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #d32f2f;">❌ Verification Failed</h2>
            <p>The verification link has expired or is invalid.</p>
            <p>Please request a new verification email.</p>
            <p><a href="/">Return to Home</a></p>
          </body>
        </html>
      `);
    }
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #d32f2f;">❌ Verification Error</h2>
          <p>An error occurred during verification. Please try again.</p>
          <p><a href="/">Return to Home</a></p>
        </body>
      </html>
    `);
  }
});

console.log('✅ Email verification endpoints loaded');

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Debug routes
app.get('/debug/routes', (req: any, res: any) => {
  const routes: any[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) {
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      });
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push({
            path: handler.route.path,
            methods: Object.keys(handler.route.methods)
          });
        }
      });
    }
  });
  res.json({ routes, timestamp: new Date().toISOString() });
});

// Serve UI preview
app.get('/', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, '../ui_preview/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Port Your Bond server running on port ${PORT}`);
  console.log(`🔧 Environment PORT: ${process.env.PORT || 'not set'}`);
  console.log(`📱 UI Preview: http://localhost:${PORT}`);
  console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
});