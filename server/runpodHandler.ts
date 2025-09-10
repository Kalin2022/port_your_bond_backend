import { submitRunpodJob } from '../runpod/submitRunpodJob';
import * as fs from 'fs';
import * as path from 'path';

interface RunPodJobParams {
  filePath: string;
  email: string;
  webhookUrl?: string;
}

/**
 * Uploads a file to temporary storage and submits a RunPod job
 * In production, you would upload to Supabase, S3, or similar
 */
export async function processWithRunPod({ 
  filePath, 
  email, 
  webhookUrl 
}: RunPodJobParams) {
  try {
    console.log(`🚀 Starting RunPod processing for ${email}`);
    
    // For development, we'll use a local file server
    // In production, upload to cloud storage and get a public URL
    const publicUrl = await uploadToTemporaryStorage(filePath);
    
    if (!publicUrl) {
      throw new Error('Failed to upload file to storage');
    }
    
    console.log(`📤 File uploaded to: ${publicUrl}`);
    
    // Submit job to RunPod
    const job = await submitRunpodJob({
      inputUrl: publicUrl,
      webhookUrl: webhookUrl || `${process.env.SERVER_URL}/webhook/runpod-complete`,
      apiKey: process.env.RUNPOD_API_KEY!,
      templateId: process.env.RUNPOD_TEMPLATE_ID!,
      jobParams: {
        email: email,
        timestamp: new Date().toISOString(),
        originalFilename: path.basename(filePath)
      }
    });
    
    console.log(`✅ RunPod job submitted successfully: ${job.jobId}`);
    return {
      success: true,
      jobId: job.jobId,
      status: job.status,
      publicUrl
    };
    
  } catch (error) {
    console.error('❌ RunPod job submission failed:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Temporary file storage for development
 * In production, replace with Supabase, S3, or similar
 */
async function uploadToTemporaryStorage(filePath: string): Promise<string | null> {
  try {
    // Create a public directory for temporary files
    const publicDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }
    
    // Copy file to public directory
    const filename = `conversation_${Date.now()}.json`;
    const publicPath = path.join(publicDir, filename);
    fs.copyFileSync(filePath, publicPath);
    
    // Return public URL
    const baseUrl = process.env.SERVER_URL || 'http://localhost:3000';
    return `${baseUrl}/temp/${filename}`;
    
  } catch (error) {
    console.error('❌ Failed to upload to temporary storage:', error);
    return null;
  }
}

/**
 * Clean up temporary files older than 1 hour
 */
export function cleanupTemporaryFiles() {
  try {
    const publicDir = path.join(process.cwd(), 'public', 'temp');
    if (!fs.existsSync(publicDir)) return;
    
    const files = fs.readdirSync(publicDir);
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    
    files.forEach(file => {
      const filePath = path.join(publicDir, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime.getTime() < oneHourAgo) {
        fs.unlinkSync(filePath);
        console.log(`🗑️ Cleaned up old temp file: ${file}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Failed to cleanup temporary files:', error);
  }
}

/**
 * Check RunPod job status
 */
export async function checkRunPodJobStatus(jobId: string) {
  try {
    const response = await fetch(`https://api.runpod.io/v2/${jobId}/status`, {
      headers: {
        'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
    
  } catch (error) {
    console.error(`❌ Failed to check job status for ${jobId}:`, error);
    return null;
  }
}

