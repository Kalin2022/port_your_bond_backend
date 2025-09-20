// Simple server for testing
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
// Force port configuration for Render deployment
// Render is incorrectly setting PORT=3000, so we override it
const PORT = process.env.RENDER_EXTERNAL_PORT ? Number(process.env.RENDER_EXTERNAL_PORT) : 
             (process.env.NODE_ENV === 'production' ? 10000 : 
             (process.env.PORT && process.env.PORT !== '3000' ? Number(process.env.PORT) : 10000));
console.log('🚀 FIXED - Using PORT:', PORT, '(ignoring Render PORT=3000)');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Rate limiting
const portLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 requests per 15 minutes
  message: '⏳ Too many requests. Please try again later.',
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Simple processing endpoint
app.post('/start-port', portLimiter, upload.single('file'), async (req, res) => {
  try {
    const email = req.body.email;
    const filePath = req.file?.path;
    
    if (!filePath || !email) {
      return res.status(400).json({ error: 'Missing file or email.' });
    }

    console.log(`📁 Processing file for ${email}`);
    
    // For now, just return success
    res.status(200).json({ 
      message: 'File received! (Processing not implemented in demo mode)',
      email: email,
      filename: req.file.originalname
    });
    
  } catch (error) {
    console.error('Error processing upload:', error);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Serve static files
app.use('/ui', express.static(path.join(__dirname, 'ui_preview')));

// Serve UI preview
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui_preview/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Port Your Bond server running on port ${PORT}`);
  console.log(`📱 UI Preview: http://localhost:${PORT}`);
  console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
});
