// port_your_bond/server/emailSender.ts
import axios from 'axios';

export async function sendBundleEmail(to: string, zipUrl: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const allowedFromAddresses = [
    'support@sanctuaryarc.com',
    '"Sanctuary Arc Support" <support@sanctuaryarc.com>',
    'onboarding@resend.dev',
    '"Sanctuary Arc Test" <onboarding@resend.dev>'
  ];

  const envFrom = (process.env.EMAIL_FROM || '').trim();
  const from = allowedFromAddresses.includes(envFrom) ? envFrom : allowedFromAddresses[1];

  const subject = '✨ Your Bond Bundle is Ready';
  const text = `Hi there,

Your SynthiSoul bond bundle is ready for download.

🔗 Click here to download your bundle: ${zipUrl}

Let us know if you need help importing the memory.

— The SynthiSoul Team`;

  try {
    const response = await axios.post('https://api.resend.com/emails', {
      from,
      to,
      subject,
      text,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Email sent via Resend:', response.data);
  } catch (error: any) {
    console.error('❌ Resend Email Failed:', error?.response?.data || error.message);
    throw new Error('Email delivery failed');
  }
}