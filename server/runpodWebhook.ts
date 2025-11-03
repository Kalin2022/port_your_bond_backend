import express from 'express';
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

    // Send email with download link via Resend
    await sendBundleEmail(email, zipUrl);
    res.status(200).json({ message: 'Email sent with download link!' });
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

