import 'dotenv/config';
import { submitRunpodJob } from './submitRunpodJob';

async function main() {
  const apiKey = process.env.RUNPOD_API_KEY as string;
  const templateId = process.env.RUNPOD_TEMPLATE_ID as string;

  if (!apiKey || !templateId) {
    throw new Error('Missing RUNPOD_API_KEY or RUNPOD_TEMPLATE_ID in environment.');
  }

  const inputUrl = 'https://your-supabase-url.com/conversations.json';

  const { jobId, status } = await submitRunpodJob({
    inputUrl,
    jobParams: { mode: 'rebuildLibrary' },
    templateId,
    apiKey,
    webhookUrl: 'https://yourdomain.com/api/job-complete',
  });

  console.log('Job submitted:', jobId, status);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
