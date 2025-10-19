// server/processRoute.ts
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { submitRunpodJob } from './utils/submitRunpodJob';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/start-port', upload.single('file'), async (req, res) => {
  const email = req.body.email;
  const file = req.file;

  if (!email || !file) {
    return res.status(400).send('Missing email or file.');
  }

  try {
    const filePath = path.resolve(file.path);
    
    // Check if RunPod is configured
    if (!process.env.RUNPOD_ENDPOINT_ID || !process.env.RUNPOD_API_KEY) {
      console.log('⚠️ RunPod not configured, simulating job submission for testing');
      res.status(200).json({
        message: 'File uploaded successfully! (RunPod not configured - testing mode)',
        jobId: 'test-job-' + Date.now(),
        testing: true
      });
      return;
    }
    
    const jobId = await submitRunpodJob({
      email,
      filePath,
      originalName: file.originalname,
    });

    res.status(200).json({
      message: 'RunPod job submitted.',
      jobId,
    });
  } catch (err) {
    console.error('RunPod job error:', err);
    res.status(500).send('RunPod submission failed.');
  }
});

export default router;