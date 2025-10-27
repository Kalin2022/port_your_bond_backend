import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { sendBundleEmail } from './emailSender';

const router = express.Router();

interface RunPodWebhookPayload {
  jobId: string;
  status: 'COMPLETED' | 'FAILED' | 'TIMED_OUT';
  output?: {
    bundle_path: string;
    bundle_size: number;
    email: string;
    timestamp: string;
  };
  error?: string;
}

router.post('/runpod-webhook', async (req, res) => {
  try {
    console.log('📬 RunPod webhook received:', JSON.stringify(req.body, null, 2));
    
    const { output, email } = req.body;

    if (!output?.zipUrl || !email) {
      console.log('⚠️ Missing zipUrl or email in webhook payload');
      return res.status(400).send('Missing zipUrl or email.');
    }

    const zipRes = await fetch(output.zipUrl);
    const buffer = await zipRes.arrayBuffer();

    // Ensure downloads directory exists
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const tmpZipPath = path.join(downloadsDir, `result-${Date.now()}.zip`);
    fs.writeFileSync(tmpZipPath, Buffer.from(buffer));

    await sendBundleEmail(email, tmpZipPath);

    res.status(200).json({ message: 'Email sent!' });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Failed to process webhook');
  }
});

// Health check for webhook endpoint
router.get('/webhook/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    endpoint: 'runpod-webhook',
    timestamp: new Date().toISOString()
  });
});

export default router;

