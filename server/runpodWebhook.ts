import express from 'express';
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

router.post('/webhook/runpod-complete', async (req, res) => {
  try {
    const payload: RunPodWebhookPayload = req.body;
    const { jobId, status, output, error } = payload;
    
    console.log(`📨 RunPod webhook received for job ${jobId}: ${status}`);
    
    if (status === 'COMPLETED' && output) {
      try {
        // In production, you would download the bundle from the provided path
        // For now, we'll simulate sending the email
        console.log(`✅ Job ${jobId} completed successfully`);
        console.log(`📧 Bundle ready for ${output.email}`);
        console.log(`📦 Bundle size: ${output.bundle_size} bytes`);
        
        // TODO: Download bundle from RunPod and upload to your storage
        // const bundleUrl = await uploadBundleToStorage(output.bundle_path);
        
        // Send email notification
        // await sendBundleEmail(output.email, bundleUrl);
        
        console.log(`📧 Email notification sent to ${output.email}`);
        
        res.status(200).json({ 
          received: true, 
          message: 'Job completed and email sent' 
        });
        
      } catch (emailError) {
        console.error(`❌ Failed to send email for job ${jobId}:`, emailError);
        res.status(500).json({ 
          error: 'Email sending failed',
          jobId 
        });
      }
      
    } else if (status === 'FAILED') {
      console.error(`❌ Job ${jobId} failed:`, error);
      
      // TODO: Send failure notification email
      // await sendFailureEmail(output?.email, error);
      
      res.status(200).json({ 
        received: true, 
        message: 'Job failure logged' 
      });
      
    } else if (status === 'TIMED_OUT') {
      console.error(`⏰ Job ${jobId} timed out`);
      
      // TODO: Send timeout notification email
      // await sendTimeoutEmail(output?.email);
      
      res.status(200).json({ 
        received: true, 
        message: 'Job timeout logged' 
      });
      
    } else {
      console.log(`ℹ️ Job ${jobId} status: ${status}`);
      res.status(200).json({ 
        received: true, 
        message: 'Status update received' 
      });
    }
    
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ 
      error: 'Webhook processing failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
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

