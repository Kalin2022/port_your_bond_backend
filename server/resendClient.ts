// server/resendClient.ts
import axios from 'axios';

type ResendRecipient = string | string[];

interface SendEmailParams {
  from: string;
  to: ResendRecipient;
  subject: string;
  html?: string;
  text?: string;
}

const RESEND_API_ROOT = 'https://api.resend.com';

export const resend = {
  emails: {
    async send(params: SendEmailParams) {
      const apiKey = process.env.RESEND_API_KEY;
      if (!apiKey) {
        throw new Error('RESEND_API_KEY is not configured');
      }

      const response = await axios.post(
        `${RESEND_API_ROOT}/emails`,
        params,
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },
  },
};
