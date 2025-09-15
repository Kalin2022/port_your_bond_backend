import express from 'express';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { insertJobRecord } from './utils/supabaseClient';
import { sendCompletionEmail } from './utils/emailer';

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

    const timestamp = new Date().toISOString();
    console.log(`📨 RunPod webhook received for job ${jobId}: ${status}`);

    // Ensure folders exist
    const resultsDir = path.join(process.cwd(), 'server', 'results');
    const logsDir = path.join(process.cwd(), 'server', 'logs');
    if (!fs.existsSync(resultsDir)) fs.mkdirSync(resultsDir, { recursive: true });
    if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

    if (status === 'COMPLETED' && output) {
      try {
        if ((output as any).downloadUrl) {
          const downloadUrl = (output as any).downloadUrl as string;
          console.log('⬇️  Downloading result from:', downloadUrl);
          const resFile = await axios.get(downloadUrl, { responseType: 'json' });
          const resultPath = path.join(resultsDir, `result-${jobId}.json`);
          fs.writeFileSync(resultPath, JSON.stringify(resFile.data, null, 2), 'utf-8');
          console.log('💾 Saved to:', resultPath);

          await insertJobRecord({
            job_id: jobId,
            user_email: (output as any)?.jobParams?.email ?? '',
            status,
            result_path: resultPath,
            result_url: downloadUrl,
            completed_at: timestamp,
            raw_output_json: resFile.data,
          });

          await sendCompletionEmail({
            jobId,
            link: downloadUrl,
            timestamp,
          });
        }

        res.status(200).json({ received: true, message: 'Job completed and processed' });
      } catch (handleErr) {
        console.error(`❌ Failed to handle completion for job ${jobId}:`, handleErr);
        res.status(500).json({ error: 'Completion handling failed', jobId });
      }
    } else if (status === 'FAILED') {
      console.error(`❌ Job ${jobId} failed:`, error);
      const failLog = `[${timestamp}] Job FAILED: ${jobId} ${error ? '- ' + error : ''}\n`;
      fs.appendFileSync(path.join(logsDir, 'failed_jobs.log'), failLog, 'utf-8');
      await insertJobRecord({
        job_id: jobId,
        user_email: (output as any)?.jobParams?.email ?? '',
        status: 'FAILED',
        error_message: typeof error === 'string' ? error : JSON.stringify(error),
        completed_at: timestamp,
      });
      res.status(200).json({ received: true, message: 'Job failure logged' });
    } else if (status === 'TIMED_OUT') {
      console.error(`⏰ Job ${jobId} timed out`);
      const timeoutLog = `[${timestamp}] Job TIMED_OUT: ${jobId}\n`;
      fs.appendFileSync(path.join(logsDir, 'failed_jobs.log'), timeoutLog, 'utf-8');
      res.status(200).json({ received: true, message: 'Job timeout logged' });
    } else {
      console.log(`ℹ️ Job ${jobId} status: ${status}`);
      res.status(200).json({ received: true, message: 'Status update received' });
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

