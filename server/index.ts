// index.ts - Main server entry point
import express from 'express';
import processRoute from './processRoute';
import { stripeWebhook } from './stripeWebhook';
import runpodWebhook from './runpodWebhook';
import * as dotenv from 'dotenv';
import * as path from 'path';


// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/ui', express.static(path.join(__dirname, '../ui_preview')));
app.use('/output', express.static(path.join(__dirname, '../outputs')));
app.use('/temp', express.static(path.join(__dirname, '../public/temp')));

// Routes
app.use('/', processRoute);
app.post('/stripe-webhook', stripeWebhook);
app.use('/', runpodWebhook);

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve UI preview
app.get('/', (req: any, res: any) => {
  res.sendFile(path.join(__dirname, '../ui_preview/index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Port Your Bond server running on port ${PORT}`);
  console.log(`📱 UI Preview: http://localhost:${PORT}`);
  console.log(`🔧 Health Check: http://localhost:${PORT}/health`);
});