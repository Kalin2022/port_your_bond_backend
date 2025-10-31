// server/utils/submitRunpodJob.ts
import axios from 'axios';
import fs from 'fs';
import FormData from 'form-data';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

export async function submitRunpodJob({ email, filePath, originalName }: {
  email: string,
  filePath: string,
  originalName: string,
}) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filePath), originalName);

  const uploadRes = await axios.post('https://tmpfiles.org/api/v1/upload', form, {
    headers: form.getHeaders()
  });

  // tmpfiles.org returns both 'url' (HTML page) and 'dl_url' (direct download)
  // We need the dl_url for direct file access
  const fileUrl = uploadRes.data?.data?.dl_url || uploadRes.data?.data?.url;
  if (!fileUrl) throw new Error('File upload failed');

  console.log(`📤 Uploaded to tmpfiles: ${fileUrl}`);

  const runpodRes = await axios.post(`https://api.runpod.ai/v2/${process.env.RUNPOD_ENDPOINT_ID}/run`, {
    input: {
      email,
      fileUrl,
    },
    webhook: "https://port-your-bond-backend.onrender.com/runpod-webhook"
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.RUNPOD_API_KEY}`,
      'Content-Type': 'application/json',
    }
  });

  const jobId = runpodRes.data?.id;
  if (!jobId) throw new Error('RunPod job failed');

  console.log(`🚀 RunPod job submitted: ${jobId}`);
  return jobId;
}
