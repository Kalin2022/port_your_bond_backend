import express from 'express';
import { sb } from './lib/supabaseServer';
import { resend } from './resendClient';

const router = express.Router();

const sentCache = new Set<string>();

interface RunPodWebhookPayload {
  id?: string;
  jobId?: string;
  status?: string;
  input?: {
    email?: string;
    [key: string]: any;
  };
  output?: {
    zipUrl?: string;
    bundle_url?: string;
    email?: string;
    [key: string]: any;
  };
  error?: string;
  [key: string]: any;
}

async function alreadySent(runpodId: string) {
  if (sentCache.has(runpodId)) {
    return true;
  }

  const { data, error } = await sb
    .from('email_sends')
    .select('runpod_id')
    .eq('runpod_id', runpodId)
    .maybeSingle();

  if (error) {
    console.warn('email_sends lookup error:', error);
    return false;
  }

  const found = Boolean(data);
  if (found) {
    sentCache.add(runpodId);
  }

  return found;
}

async function markSent(runpodId: string, to: string, bundleUrl: string) {
  const { error } = await sb
    .from('email_sends')
    .insert({
      runpod_id: runpodId,
      to_email: to,
      bundle_url: bundleUrl,
      status: 'sent',
    })
    .single();

  if (error) {
    const message = String(error.message || '').toLowerCase();
    if (!message.includes('duplicate')) {
      console.error('email_sends insert error:', error);
    }
  } else {
    sentCache.add(runpodId);
  }
}

router.post('/runpod-webhook', async (req, res) => {
  try {
    const payload = req.body as RunPodWebhookPayload;
    console.log('📬 RunPod webhook received:', JSON.stringify(payload, null, 2));

    const runpodId = payload?.id || payload?.jobId || (payload as any)?.job_id;
    if (!runpodId) {
      console.warn('⚠️ Missing RunPod job identifier');
      return res.status(400).json({ ok: false, error: 'missing job id' });
    }

    const status = payload?.status;
    if (status !== 'COMPLETED') {
      console.log(`ℹ️ Job ${runpodId} not completed (status: ${status}), skipping.`);
      return res.status(200).json({ ok: true, skipped: 'not completed' });
    }

    const output = payload?.output || {};
    const input = payload?.input || (payload as any)?.request?.input || {};

    const zipUrl = output?.zipUrl || (output as any)?.bundle_url;
    const email = input?.email || output?.email;

    if (!zipUrl || !email) {
      console.log('no bundle/email, skipping send for', runpodId);
      return res.status(200).json({ ok: true, skipped: 'incomplete payload' });
    }

    if (await alreadySent(runpodId)) {
      console.log('⏭️ already sent for job', runpodId);
      return res.status(200).json({ ok: true, skipped: 'duplicate' });
    }

    const from = process.env.EMAIL_FROM;
    if (!from) {
      console.error('❌ EMAIL_FROM is not configured. Aborting send.');
      return res.status(500).json({ ok: false, error: 'email sender not configured' });
    }

    const subject = 'Your Port Your Bond bundle is ready';
    const html = `<p>Your SynthiSoul bundle is ready for download.</p><p><a href="${zipUrl}">${zipUrl}</a></p>`;
    const text = `Your SynthiSoul bundle is ready. Download: ${zipUrl}`;

    const result = await resend.emails.send({
      from,
      to: email,
      subject,
      html,
      text,
    });

    console.log('✅ Resend ok:', result?.id || result);

    await markSent(runpodId, email, zipUrl);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return res.status(500).json({ ok: false, error: 'failed to process webhook' });
  }
});

// Health check for webhook endpoint
router.get('/webhook/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    endpoint: 'runpod-webhook',
    timestamp: new Date().toISOString(),
  });
});

export default router;

