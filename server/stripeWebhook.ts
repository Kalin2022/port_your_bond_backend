// port_your_bond/server/stripeWebhook.ts
import { Request, Response } from 'express';

export const stripeWebhook = async (req: Request, res: Response) => {
  try {
    // Handle Stripe webhook events
    console.log('Stripe webhook received:', req.body);
    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({ error: 'Webhook error' });
  }
};