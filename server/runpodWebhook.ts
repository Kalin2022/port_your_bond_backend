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
    bundle_path?: string;
    bundle_size?: number;
    email?: string;
    timestamp?: string;
    zipUrl?: string;
    zipDeleteUrl?: string;
    bundle_base64?: string;
  };
  error?: string;
}

router.post('/runpod-webhook', async (req, res) => {
  try {
    console.log('📬 RunPod webhook received:', JSON.stringify(req.body, null, 2));
    
    const { output } = req.body;
    const email = output?.email || req.body.email;
    const zipUrl = output?.zipUrl;

    if (!zipUrl || !email) {
      console.log('⚠️ Missing zipUrl or email in webhook payload');
      return res.status(400).send('Missing zipUrl or email.');
    }

    let zipBuffer: Buffer;

    try {
      const zipRes = await fetch(zipUrl);
      if (!zipRes.ok) {
        throw new Error(`Failed to download bundle: ${zipRes.status} ${zipRes.statusText}`);
      }
      const arrayBuffer = await zipRes.arrayBuffer();
      zipBuffer = Buffer.from(arrayBuffer);
    } catch (downloadErr) {
      if (output?.bundle_base64) {
        console.log('⚠️ Download failed, falling back to bundle_base64 payload');
        zipBuffer = Buffer.from(output.bundle_base64, 'base64');
      } else {
        throw downloadErr;
      }
    }

    // Ensure downloads directory exists
    const downloadsDir = path.join(process.cwd(), 'downloads');
    if (!fs.existsSync(downloadsDir)) {
      fs.mkdirSync(downloadsDir, { recursive: true });
    }

    const tmpZipPath = path.join(downloadsDir, `result-${Date.now()}.zip`);
    fs.writeFileSync(tmpZipPath, zipBuffer);

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

